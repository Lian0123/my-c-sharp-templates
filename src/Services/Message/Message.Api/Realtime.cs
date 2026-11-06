using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Application;
using MicroserviceStarter.Message.Infrastructure;
using StackExchange.Redis;

namespace MicroserviceStarter.Message.Api;

public sealed record ChatConnection(string Id, Guid UserId, Guid SessionId, long SecurityVersion, DateTimeOffset TokenExpiresAt);

public sealed class ConnectionRegistry(IConnectionMultiplexer redis, IServiceScopeFactory scopes, ILogger<ConnectionRegistry> logger) : BackgroundService
{
    private readonly ConcurrentDictionary<string, (ChatConnection State, Action Abort)> local = new();
    private static readonly RedisChannel Channel = RedisChannel.Literal("chat:disconnect");
    public async Task Add(ChatConnection connection, Action abort)
    {
        local[connection.Id] = (connection, abort);
        await Touch(connection.Id);
    }
    public async Task Touch(string id)
    {
        if (!local.TryGetValue(id, out var item)) return;
        var db = redis.GetDatabase();
        await db.StringSetAsync("chat:connection:" + id, Json.Write(item.State), TimeSpan.FromSeconds(120));
        await db.SetAddAsync("chat:user:" + item.State.UserId, id);
        await db.KeyExpireAsync("chat:user:" + item.State.UserId, TimeSpan.FromSeconds(120));
        await db.SetAddAsync("chat:session:" + item.State.SessionId, id);
        await db.KeyExpireAsync("chat:session:" + item.State.SessionId, TimeSpan.FromSeconds(120));
        await db.SortedSetAddAsync("chat:presence:" + item.State.UserId, id, DateTimeOffset.UtcNow.AddSeconds(120).ToUnixTimeSeconds());
        await db.KeyExpireAsync("chat:presence:" + item.State.UserId, TimeSpan.FromSeconds(150));
    }
    public async Task Remove(string id)
    {
        if (!local.TryRemove(id, out var item)) return;
        try
        {
            var db = redis.GetDatabase();
            await db.KeyDeleteAsync("chat:connection:" + id);
            await db.SetRemoveAsync("chat:user:" + item.State.UserId, id);
            await db.SetRemoveAsync("chat:session:" + item.State.SessionId, id);
            await db.SortedSetRemoveAsync("chat:presence:" + item.State.UserId, id);
        }
        catch (RedisException) { }
    }
    public async Task<IReadOnlyList<ChatConnection>> ForUsers(Guid[] users)
    {
        var result = new List<ChatConnection>();
        var db = redis.GetDatabase();
        foreach (var user in users)
            foreach (var id in await db.SetMembersAsync("chat:user:" + user))
            {
                var value = await db.StringGetAsync("chat:connection:" + id);
                if (value.HasValue)
                {
                    var connection = Json.Read<ChatConnection>(value.ToString());
                    if (connection.TokenExpiresAt > DateTimeOffset.UtcNow) result.Add(connection);
                }
                else await db.SetRemoveAsync("chat:user:" + user, id);
            }
        return result;
    }
    public async Task Revoke(Guid[] sessions)
    {
        var db = redis.GetDatabase();
        foreach (var session in sessions)
            foreach (var id in await db.SetMembersAsync("chat:session:" + session))
            { await db.KeyDeleteAsync("chat:connection:" + id); await redis.GetSubscriber().PublishAsync(Channel, id); }
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await redis.GetSubscriber().SubscribeAsync(Channel, (_, id) => { if (local.TryGetValue(id.ToString(), out var item)) item.Abort(); });
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(2000, stoppingToken);
            var snapshot = local.Values.ToArray();
            if (snapshot.Length == 0) continue;
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var validator = scope.ServiceProvider.GetRequiredService<ISessionValidator>();
                foreach (var batch in snapshot.Chunk(500))
                {
                    var states = await validator.Check(batch.Select(x => new SessionProbe(x.State.SessionId, x.State.UserId, x.State.SecurityVersion)).ToArray(), stoppingToken);
                    foreach (var item in batch)
                    {
                        var stored = await redis.GetDatabase().KeyExistsAsync("chat:connection:" + item.State.Id);
                        if (!stored || item.State.TokenExpiresAt <= DateTimeOffset.UtcNow || !states.Any(x => x.SessionId == item.State.SessionId && x.Active)) item.Abort();
                    }
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            { logger.LogWarning("Realtime validation unavailable: {Failure}", ex.GetType().Name); foreach (var item in snapshot) item.Abort(); }
        }
    }
}

[Authorize]
public sealed class ChatHub(ConnectionRegistry registry, ISessionValidator validator) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var actor = Context.User!.Actor();
        var expires = DateTimeOffset.FromUnixTimeSeconds(long.Parse(Context.User!.FindFirst("exp")!.Value));
        await registry.Add(new(Context.ConnectionId, actor.UserId, actor.SessionId, actor.SecurityVersion, expires), Context.Abort);
        await base.OnConnectedAsync();
    }
    public async Task Heartbeat()
    {
        var actor = Context.User!.Actor();
        var state = await validator.Check([new(actor.SessionId, actor.UserId, actor.SecurityVersion)], Context.ConnectionAborted);
        if (!state.Any(x => x.Active)) { Context.Abort(); return; }
        await registry.Touch(Context.ConnectionId);
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    { await registry.Remove(Context.ConnectionId); await base.OnDisconnectedAsync(exception); }
}

public sealed class ChatNotifier(MessageDbContext db, ConnectionRegistry registry, ISessionValidator validator, IHubContext<ChatHub> hub) : IChatNotifier
{
    public Task Changed(ChatChanged change, CancellationToken ct) => Deliver(change.RoomId, new { kind = "message", change.RoomId, change.MessageId, change.Sequence }, ct);
    public Task Signal(Guid roomId, string kind, CancellationToken ct) => Deliver(roomId, new { kind, roomId }, ct);
    private async Task Deliver(Guid roomId, object payload, CancellationToken ct)
    {
        var members = await db.Members.AsNoTracking().Where(x => x.RoomId == roomId).Select(x => x.UserId).ToArrayAsync(ct);
        var connections = await registry.ForUsers(members);
        foreach (var batch in connections.Chunk(500))
        {
            var states = await validator.Check(batch.Select(x => new SessionProbe(x.SessionId, x.UserId, x.SecurityVersion)).ToArray(), ct);
            var active = batch.Where(x => states.Any(s => s.SessionId == x.SessionId && s.Active)).Select(x => x.Id).ToArray();
            if (active.Length > 0) await hub.Clients.Clients(active).SendAsync("changed", payload, ct);
        }
    }
}
