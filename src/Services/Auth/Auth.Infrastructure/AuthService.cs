using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.Auth.Domain;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using StackExchange.Redis;

namespace MicroserviceStarter.Auth.Infrastructure;

public sealed class AuthService(AuthDbContext db, IConfiguration config, IConnectionMultiplexer redis,
    IDataProtectionProvider protection, IHttpClientFactory httpFactory, ILogger<AuthService> logger, TimeProvider time) : IAuthService, ISessionValidator
{
    private readonly PasswordHasher<User> passwords = new();
    private DateTimeOffset Now => time.GetUtcNow();

    public async Task<Guid> Register(RegisterRequest request, CancellationToken ct)
    {
        request.Validate();
        var email = IdentityRules.NormalizeEmail(request.Email);
        var displayName = Guard.Text(request.DisplayName, "displayName", 50);
        if (await db.Users.AnyAsync(x => x.NormalizedEmail == email, ct)) throw new AppException(Errors.EmailInUse);
        var user = new User { Email = request.Email.Trim(), NormalizedEmail = email, InitialDisplayName = displayName };
        user.PasswordHash = passwords.HashPassword(user, IdentityRules.Password(request.Password));
        db.Users.Add(user);
        Publish(user);
        await Challenge(user, "verify", ct);
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: "23505" })
        { throw new AppException(Errors.EmailInUse); }
        return user.Id;
    }

    public async Task<SessionResult> Login(LoginRequest request, string address, CancellationToken ct)
    {
        request.Validate();
        var email = IdentityRules.NormalizeEmail(request.Email);
        await Limit("login:" + IdentityRules.Hash(address), 30, TimeSpan.FromMinutes(1));
        var failures = "auth:fail:" + IdentityRules.Hash(email);
        var cache = redis.GetDatabase();
        var count = await cache.StringGetAsync(failures);
        if (count.HasValue && (int)count >= 5) throw new AppException(Errors.RateLimited, "帳號暫時鎖定，請於 15 分鐘後重試");
        var user = await db.Users.SingleOrDefaultAsync(x => x.NormalizedEmail == email, ct);
        // Always run a password hash operation, including unknown users.
        var dummy = new User();
        var hash = user?.PasswordHash ?? passwords.HashPassword(dummy, "a-constant-dummy-password");
        if (passwords.VerifyHashedPassword(user ?? dummy, hash, request.Password) == PasswordVerificationResult.Failed || user is null || !user.Active)
        {
            await Increment(failures, TimeSpan.FromMinutes(15));
            throw new AppException(Errors.Credentials);
        }
        if (!user.EmailVerified) throw new AppException(Errors.EmailUnverified);
        await cache.KeyDeleteAsync(failures);
        var result = CreateSession(user);
        await db.SaveChangesAsync(ct);
        return result;
    }

    public async Task<SessionResult> Refresh(string token, string csrf, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length > 128 || csrf.Length > 128) throw new AppException(Errors.Unauthenticated);
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var hash = IdentityRules.Hash(token);
        var old = await db.Sessions.FromSqlInterpolated($"SELECT * FROM \"Sessions\" WHERE \"RefreshHash\" = {hash} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (old is null || old.ExpiresAt <= Now) throw new AppException(Errors.Unauthenticated);
        if (old.CsrfHash != IdentityRules.Hash(csrf)) throw new AppException(Errors.Forbidden, "CSRF 驗證失敗");
        if (old.RevokedAt is not null)
        {
            var family = await db.Sessions.Where(x => x.FamilyId == old.FamilyId && x.RevokedAt == null).ToListAsync(ct);
            foreach (var session in family) session.RevokedAt = Now;
            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            await Disconnect(family.Select(x => x.Id).ToArray(), ct);
            throw new AppException(Errors.Unauthenticated, "Refresh Token 已使用，相關登入已撤銷");
        }
        var user = await db.Users.SingleAsync(x => x.Id == old.UserId, ct);
        if (!user.Active || !user.EmailVerified) throw new AppException(Errors.Unauthenticated);
        old.RevokedAt = Now;
        var result = CreateSession(user, old.FamilyId, old.ExpiresAt);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        await Disconnect([old.Id], ct);
        return result;
    }

    public async Task Logout(Actor actor, string csrf, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var session = await db.Sessions.FromSqlInterpolated($"SELECT * FROM \"Sessions\" WHERE \"Id\" = {actor.SessionId} AND \"UserId\" = {actor.UserId} FOR UPDATE")
            .SingleOrDefaultAsync(ct) ?? throw new AppException(Errors.Unauthenticated);
        if (session.CsrfHash != IdentityRules.Hash(csrf)) throw new AppException(Errors.Forbidden);
        var family = await db.Sessions.Where(x => x.FamilyId == session.FamilyId && x.RevokedAt == null).ToListAsync(ct);
        foreach (var member in family) member.RevokedAt = Now;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        await Disconnect(family.Select(x => x.Id).Append(session.Id).Distinct().ToArray(), ct);
    }

    public async Task SendChallenge(EmailRequest request, string purpose, CancellationToken ct)
    {
        request.Validate();
        var email = IdentityRules.NormalizeEmail(request.Email);
        await Limit("mail:" + IdentityRules.Hash(email), 3, TimeSpan.FromMinutes(15));
        var user = await db.Users.SingleOrDefaultAsync(x => x.NormalizedEmail == email && x.Active, ct);
        if (user is null || purpose == "verify" && user.EmailVerified) return;
        await Challenge(user, purpose, ct);
        await db.SaveChangesAsync(ct);
    }

    public async Task Verify(string token, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var challenge = await FindChallenge(token, "verify", ct);
        var user = await db.Users.SingleAsync(x => x.Id == challenge.UserId, ct);
        user.EmailVerified = true;
        challenge.UsedAt = Now;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }

    public async Task Reset(ResetRequest request, CancellationToken ct)
    {
        request.Validate();
        IdentityRules.Password(request.Password);
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var challenge = await FindChallenge(request.Token, "reset", ct);
        var user = await db.Users.SingleAsync(x => x.Id == challenge.UserId, ct);
        user.PasswordHash = passwords.HashPassword(user, request.Password);
        user.SecurityVersion++;
        challenge.UsedAt = Now;
        var sessions = await db.Sessions.Where(x => x.UserId == user.Id && x.RevokedAt == null).ToListAsync(ct);
        foreach (var session in sessions) session.RevokedAt = Now;
        Publish(user);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        await Disconnect(sessions.Select(x => x.Id).ToArray(), ct);
    }

    public async Task<IReadOnlyList<SessionState>> Check(IReadOnlyList<SessionProbe> probes, CancellationToken ct)
    {
        if (probes.Count > 1000) throw new AppException(Errors.Validation);
        if (probes.Count == 0) return [];
        var ids = probes.Select(x => x.SessionId).Distinct().ToArray();
        var revoked = new HashSet<Guid>();
        try
        {
            var values = await redis.GetDatabase().StringGetAsync(ids.Select(id => (RedisKey)("auth:revoked:" + id)).ToArray())
                .WaitAsync(TimeSpan.FromMilliseconds(50), ct);
            for (var index = 0; index < ids.Length; index++) if (values[index].HasValue) revoked.Add(ids[index]);
        }
        catch (Exception ex) when (ex is RedisException or TimeoutException) { /* Negative-cache outages never authorize a session. */ }
        var pending = ids.Except(revoked).ToArray();
        var states = await (from s in db.Sessions.AsNoTracking()
                            join u in db.Users.AsNoTracking() on s.UserId equals u.Id
                            where pending.Contains(s.Id)
                            select new { Session = s, User = u }).ToListAsync(ct);
        return probes.Select(probe =>
        {
            var state = states.FirstOrDefault(x => x.Session.Id == probe.SessionId && x.User.Id == probe.UserId);
            return new SessionState(probe.SessionId, probe.UserId,
                state is not null && state.User.Active && state.User.EmailVerified && state.Session.RevokedAt is null
                    && state.Session.ExpiresAt > Now && state.User.SecurityVersion == probe.SecurityVersion,
                state?.User.Role ?? "User");
        }).ToArray();
    }

    public async Task<IReadOnlyList<UserView>> Users(Actor actor, int limit, CancellationToken ct)
    {
        Admin(actor);
        return await db.Users.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(Guard.PageSize(limit))
            .Select(x => new UserView(x.Id, x.Email, x.InitialDisplayName, x.Role, x.Active, x.EmailVerified, x.CreatedAt)).ToListAsync(ct);
    }

    public async Task Manage(Actor actor, Guid id, ManageUserRequest request, CancellationToken ct)
    {
        Admin(actor); IdentityRules.Role(request.Role); Guard.Reason(request.Reason);
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        // All admin-count mutations take the same lock to prevent concurrent removal of the last admins.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(4011002)", ct);
        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new AppException(Errors.NotFound);
        var count = await db.Users.CountAsync(x => x.Active && x.Role == "Admin", ct);
        IdentityRules.RequireAnotherAdmin(user.Active && user.Role == "Admin", request.Active && request.Role == "Admin", count);
        user.Role = request.Role; user.Active = request.Active; user.SecurityVersion++;
        var sessions = await db.Sessions.Where(x => x.UserId == id && x.RevokedAt == null).ToListAsync(ct);
        foreach (var session in sessions) session.RevokedAt = Now;
        db.Record(actor, "identity.manage", id.ToString(), request.Reason);
        Publish(user);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        await Disconnect(sessions.Select(x => x.Id).ToArray(), ct);
    }

    public async Task Seed(CancellationToken ct)
    {
        var email = config["Bootstrap:Email"];
        if (string.IsNullOrWhiteSpace(email)) return;
        var normalized = IdentityRules.NormalizeEmail(email);
        if (await db.Users.AnyAsync(x => x.NormalizedEmail == normalized, ct)) return;
        var user = new User { Email = email, NormalizedEmail = normalized, InitialDisplayName = "系統管理員", Role = "Admin", EmailVerified = true };
        user.PasswordHash = passwords.HashPassword(user, IdentityRules.Password(config["Bootstrap:Password"] ?? ""));
        db.Users.Add(user); Publish(user);
        await db.SaveChangesAsync(ct);
    }

    private SessionResult CreateSession(User user, Guid? family = null, DateTimeOffset? expires = null)
    {
        var refresh = IdentityRules.Secret(); var csrf = IdentityRules.Secret();
        var session = new LoginSession
        {
            UserId = user.Id,
            RefreshHash = IdentityRules.Hash(refresh),
            CsrfHash = IdentityRules.Hash(csrf),
            FamilyId = family ?? Guid.CreateVersion7(),
            ExpiresAt = expires ?? Now.AddDays(7)
        };
        db.Sessions.Add(session);
        using var rsa = RSA.Create();
        rsa.ImportFromPem(File.ReadAllText(config["Jwt:PrivateKeyPath"] ?? throw new InvalidOperationException("JWT private key is required")));
        var key = new RsaSecurityKey(rsa) { KeyId = Convert.ToHexString(SHA256.HashData(rsa.ExportSubjectPublicKeyInfo()))[..16] };
        var jwt = new JwtSecurityToken(config["Jwt:Issuer"] ?? "MicroserviceStarter", "microservice-api",
            [new("sub", user.Id.ToString()), new("sid", session.Id.ToString()), new("ver", user.SecurityVersion.ToString()),
             new("role", user.Role), new("jti", Guid.NewGuid().ToString())], Now.UtcDateTime, Now.AddMinutes(5).UtcDateTime,
            new SigningCredentials(key, SecurityAlgorithms.RsaSha256)
            { CryptoProviderFactory = new CryptoProviderFactory { CacheSignatureProviders = false } });
        var view = new UserView(user.Id, user.Email, user.InitialDisplayName, user.Role, user.Active, user.EmailVerified, user.CreatedAt);
        return new(new(new JwtSecurityTokenHandler().WriteToken(jwt), 300, csrf, view), refresh, session.ExpiresAt);
    }

    private async Task Challenge(User user, string purpose, CancellationToken ct)
    {
        var existing = await db.Challenges.Where(x => x.UserId == user.Id && x.Purpose == purpose && x.UsedAt == null).ToListAsync(ct);
        foreach (var challenge in existing) challenge.UsedAt = Now;
        var token = IdentityRules.Secret();
        db.Challenges.Add(new()
        {
            UserId = user.Id,
            Purpose = purpose,
            TokenHash = IdentityRules.Hash(token),
            ExpiresAt = purpose == "verify" ? Now.AddHours(24) : Now.AddMinutes(15)
        });
        var url = (config["PublicUrl"] ?? "http://localhost:8080").TrimEnd('/') + "/auth/" + purpose + "?token=" + token;
        db.MailJobs.Add(new()
        {
            Recipient = user.Email,
            Subject = purpose == "verify" ? "驗證您的 Email" : "重設密碼",
            ProtectedBody = protection.CreateProtector("auth-mail-v1").Protect("請開啟以下連結完成操作：\n" + url)
        });
    }

    private async Task<EmailChallenge> FindChallenge(string token, string purpose, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(token) || token.Length > 128) throw new AppException(Errors.InvalidToken);
        var hash = IdentityRules.Hash(token);
        var challenge = await db.Challenges.FromSqlInterpolated($"SELECT * FROM \"Challenges\" WHERE \"TokenHash\" = {hash} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (challenge is null || challenge.Purpose != purpose || challenge.UsedAt is not null || challenge.ExpiresAt <= Now)
            throw new AppException(Errors.InvalidToken);
        return challenge;
    }

    private void Publish(User user) => db.Enqueue(EventTypes.IdentityChanged, user.Id, user.SecurityVersion,
        new IdentityChanged(user.Id, user.InitialDisplayName, user.Active, user.SecurityVersion));
    private static void Admin(Actor actor) { if (!actor.IsAdmin) throw new AppException(Errors.Forbidden); }
    private async Task Limit(string key, int max, TimeSpan expiry)
    { if (await Increment("auth:limit:" + key, expiry) > max) throw new AppException(Errors.RateLimited); }
    private async Task<long> Increment(string key, TimeSpan expiry) => (long)await redis.GetDatabase().ScriptEvaluateAsync(
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n", [key], [(long)expiry.TotalSeconds]);
    private async Task Disconnect(Guid[] ids, CancellationToken ct)
    {
        if (ids.Length == 0) return;
        try
        {
            foreach (var id in ids) await redis.GetDatabase().StringSetAsync("auth:revoked:" + id, "1", TimeSpan.FromDays(7), flags: CommandFlags.FireAndForget);
        }
        catch (RedisException) { /* PostgreSQL already contains the authoritative revocation. */ }
        try
        {
            using var client = httpFactory.CreateClient(); client.Timeout = TimeSpan.FromSeconds(2);
            using var message = new HttpRequestMessage(HttpMethod.Post, config["Message:Url"] + "/internal/sessions/revoke")
            { Content = System.Net.Http.Json.JsonContent.Create(ids) };
            message.Headers.Add("X-Service-Id", "Auth"); message.Headers.Add("X-Service-Key", config["Internal:AuthKey"]);
            using var response = await client.SendAsync(message, ct);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        { logger.LogWarning("Connection close deferred; authoritative session is already revoked"); }
    }
}
