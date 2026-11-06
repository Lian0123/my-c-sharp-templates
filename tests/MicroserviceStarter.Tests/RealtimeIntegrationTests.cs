extern alias MessageApi;
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Application;
using StackExchange.Redis;
using Registry = MessageApi::MicroserviceStarter.Message.Api.ConnectionRegistry;
using Connection = MessageApi::MicroserviceStarter.Message.Api.ChatConnection;
using static MicroserviceStarter.Tests.IntegrationFixture;

namespace MicroserviceStarter.Tests;

[Collection("Integration")]
public class RealtimeIntegrationTests(IntegrationFixture fixture)
{
    private HubConnection Hub(TestLogin login) => new HubConnectionBuilder().WithUrl("http://localhost/hubs/chat", options =>
    {
        options.Transports = HttpTransportType.WebSockets; options.SkipNegotiation = true;
        options.AccessTokenProvider = () => Task.FromResult<string?>(login.Login.AccessToken);
        options.WebSocketFactory = async (context, ct) =>
        {
            var client = fixture.Message.Server.CreateWebSocketClient();
            client.ConfigureRequest = request => request.Headers.Authorization = "Bearer " + login.Login.AccessToken;
            return await client.ConnectAsync(context.Uri, ct);
        };
    }).Build();
    [IntegrationFact]
    public async Task WebsocketPushPresenceHeartbeatAndImmediateSessionRevocationAreEnforced()
    {
        var owner = await fixture.Register(); var member = await fixture.Register();
        await Wait(async () => await Database<MicroserviceStarter.Message.Infrastructure.MessageDbContext, bool>(fixture.Message.Services, db => Task.FromResult(db.Users.Count() >= 2)));
        using var client = fixture.Client(fixture.Message, owner);
        RoomView? room = null;
        await Wait(async () => { var response = await client.PostAsJsonAsync("/api/v1/chat/direct", new DirectRequest(member.Login.User.Id)); if (response.StatusCode != HttpStatusCode.OK) return false; room = await response.Content.ReadFromJsonAsync<RoomView>(); return true; });
        await using var hub = Hub(member); var notification = new TaskCompletionSource<System.Text.Json.Nodes.JsonObject>(TaskCreationOptions.RunContinuationsAsynchronously);
        hub.On<System.Text.Json.Nodes.JsonObject>("changed", value => { if (value["messageId"] is not null) notification.TrySetResult(value); });
        await hub.StartAsync(); await hub.InvokeAsync("Heartbeat");
        var roomId = room!.Id;
        var sent = await client.PostAsJsonAsync($"/api/v1/chat/rooms/{roomId}/messages", new SendRequest(Guid.NewGuid(), "即時推送驗證", []));
        Assert.Equal(HttpStatusCode.OK, sent.StatusCode);
        var received = await notification.Task.WaitAsync(TimeSpan.FromSeconds(10)); Assert.Equal(roomId, received["roomId"]!.GetValue<Guid>());
        var registry = fixture.Message.Services.GetRequiredService<Registry>();
        Assert.NotEmpty(await registry.ForUsers([member.Login.User.Id]));
        using var own = fixture.Client(fixture.Message, member);
        var rooms = (await (await own.GetAsync("/api/v1/chat/rooms")).Content.ReadFromJsonAsync<RoomView[]>())!;
        Assert.True(rooms.Single(x => x.Id == roomId).Members.Single(x => x.UserId == member.Login.User.Id).Online);
        var closed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously); hub.Closed += _ => { closed.TrySetResult(); return Task.CompletedTask; };
        Assert.Equal(HttpStatusCode.NoContent, (await member.Client.PostAsync("/api/v1/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await own.GetAsync("/api/v1/chat/rooms")).StatusCode);
        await closed.Task.WaitAsync(TimeSpan.FromSeconds(8));
        await registry.Touch("unknown"); await registry.Remove("unknown");
    }
    [IntegrationFact]
    public async Task RegistryRemovesExpiredIndexesAndHonorsExplicitInternalRevocation()
    {
        var user = await fixture.Register(); var registry = fixture.Message.Services.GetRequiredService<Registry>();
        var claims = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(user.Login.AccessToken).Claims.ToDictionary(x => x.Type, x => x.Value);
        var sid = Guid.Parse(claims["sid"]); var version = long.Parse(claims["ver"]);
        var count = 0; var id = Guid.NewGuid().ToString();
        await registry.Add(new Connection(id, user.Login.User.Id, sid, version, DateTimeOffset.UtcNow.AddMinutes(1)), () => Interlocked.Increment(ref count));
        var redis = fixture.Message.Services.GetRequiredService<IConnectionMultiplexer>().GetDatabase();
        await redis.SetAddAsync("chat:user:" + user.Login.User.Id, "stale-id");
        Assert.Single(await registry.ForUsers([user.Login.User.Id]));
        using var client = fixture.Message.CreateClient(); client.DefaultRequestHeaders.Add("X-Service-Id", "Auth"); client.DefaultRequestHeaders.Add("X-Service-Key", fixture.Env["INTERNAL_AUTH_KEY"]);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/internal/sessions/revoke", new[] { sid })).StatusCode);
        await Wait(() => Task.FromResult(Volatile.Read(ref count) > 0));
        await registry.Remove(id); Assert.Empty(await registry.ForUsers([user.Login.User.Id]));
        var expired = Guid.NewGuid().ToString(); await registry.Add(new Connection(expired, user.Login.User.Id, sid, version, DateTimeOffset.UtcNow.AddSeconds(-1)), () => Interlocked.Increment(ref count));
        Assert.Empty(await registry.ForUsers([user.Login.User.Id])); await Wait(() => Task.FromResult(Volatile.Read(ref count) > 1)); await registry.Remove(expired);
    }
}
