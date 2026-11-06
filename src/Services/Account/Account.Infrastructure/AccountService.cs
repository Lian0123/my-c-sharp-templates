using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.Account.Application;
using MicroserviceStarter.Account.Domain;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using StackExchange.Redis;

namespace MicroserviceStarter.Account.Infrastructure;

public sealed class AccountService(AccountDbContext db, IConnectionMultiplexer redis) : IAccountService
{
    public async Task<ProfileView?> Me(Actor actor, CancellationToken ct)
    {
        var key = "account:profile:" + actor.UserId;
        try
        {
            var cached = await redis.GetDatabase().StringGetAsync(key);
            if (cached.HasValue) return Json.Read<ProfileView>(cached.ToString());
        }
        catch (Exception ex) when (ex is RedisException or System.Text.Json.JsonException or AppException)
        { /* Missing or corrupt caches never replace PostgreSQL as the source of truth. */ }
        var profile = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(x => x.Id == actor.UserId, ct);
        if (profile is null) return null;
        var view = View(profile);
        try { await redis.GetDatabase().StringSetAsync(key, Json.Write(view), TimeSpan.FromSeconds(30)); }
        catch (RedisException) { }
        return view;
    }

    public async Task<ProfileView> Update(Actor actor, Guid id, ProfileRequest request, string? reason, CancellationToken ct)
    {
        if (id != actor.UserId && !actor.IsAdmin) throw new AppException(Errors.Forbidden);
        request.Validate();
        if (actor.IsAdmin) Guard.Reason(reason);
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new AppException(Errors.AccountMissing);
        profile.Update(request.DisplayName, request.Bio);
        db.Enqueue(EventTypes.ProfileChanged, id, profile.Version, new ProfileChanged(id, profile.DisplayName, profile.Bio, profile.Active, profile.Version));
        if (actor.IsAdmin) db.Record(actor, "profile.update", id.ToString(), reason!);
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw new AppException(Errors.Conflict); }
        try { await redis.GetDatabase().KeyDeleteAsync("account:profile:" + id); }
        catch (RedisException) { }
        return View(profile);
    }

    public async Task<IReadOnlyList<ProfileView>> Search(string? search, int limit, CancellationToken ct)
    {
        Guard.PageSize(limit);
        var query = db.Profiles.AsNoTracking().Where(x => x.Active);
        if (!string.IsNullOrWhiteSpace(search)) { var text = Guard.Text(search, "search", 50); query = query.Where(x => x.DisplayName.Contains(text)); }
        return await query.OrderBy(x => x.DisplayName).ThenBy(x => x.Id).Take(limit)
            .Select(x => new ProfileView(x.Id, x.DisplayName, x.Bio, x.Active, x.Version)).ToListAsync(ct);
    }
    private static ProfileView View(Profile profile) => new(profile.Id, profile.DisplayName, profile.Bio, profile.Active, profile.Version);
}

public sealed class AccountIntegrationHandler(AccountDbContext db, IConnectionMultiplexer redis) : IIntegrationHandler
{
    public IReadOnlyList<string> Bindings => [EventTypes.IdentityChanged];
    public async Task Handle(IntegrationEvent envelope, CancellationToken ct)
    {
        if (envelope.Type != EventTypes.IdentityChanged) throw new InvalidDataException("Unsupported event");
        var change = Json.Read<IdentityChanged>(envelope.Payload);
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == change.UserId, ct);
        if (profile is not null && profile.IdentityVersion >= change.Version) return;
        if (profile is null)
        {
            profile = new Profile { Id = change.UserId, DisplayName = Guard.Text(change.DisplayName, "displayName", 50) };
            db.Profiles.Add(profile);
        }
        profile.IdentityVersion = change.Version; profile.Active = change.Active; profile.Version++;
        db.Enqueue(EventTypes.ProfileChanged, profile.Id, profile.Version,
            new ProfileChanged(profile.Id, profile.DisplayName, profile.Bio, profile.Active, profile.Version));
        try { await redis.GetDatabase().KeyDeleteAsync("account:profile:" + profile.Id); }
        catch (RedisException) { }
    }
}
