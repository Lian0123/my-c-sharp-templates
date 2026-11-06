using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.Auth.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using static MicroserviceStarter.Tests.IntegrationFixture;

namespace MicroserviceStarter.Tests;

[Collection("Integration")]
public class AuthEdgeIntegrationTests(IntegrationFixture fixture)
{
    public static Actor Actor(TestLogin login)
    {
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(login.Login.AccessToken).Claims.ToDictionary(x => x.Type, x => x.Value);
        return new(Guid.Parse(claims["sub"]), Guid.Parse(claims["sid"]), long.Parse(claims["ver"]), claims["role"]);
    }
    [IntegrationFact]
    public async Task RefreshRejectsMissingExpiredMismatchedAndInactiveCredentials()
    {
        var login = await fixture.Register(); var actor = Actor(login);
        await using var scope = fixture.Auth.Services.CreateAsyncScope(); var service = scope.ServiceProvider.GetRequiredService<AuthService>();
        foreach (var token in new[] { "", new string('x', 129), "unknown-refresh-token" })
            Assert.Equal(Errors.Unauthenticated, (await Assert.ThrowsAsync<AppException>(() => service.Refresh(token, login.Login.CsrfToken, default))).Error);
        Assert.Equal(Errors.Unauthenticated, (await Assert.ThrowsAsync<AppException>(() => service.Refresh(login.RefreshToken, new string('x', 129), default))).Error);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Refresh(login.RefreshToken, "incorrect-csrf", default))).Error);
        Assert.Equal(Errors.Unauthenticated, (await Assert.ThrowsAsync<AppException>(() => service.Logout(actor with { SessionId = Guid.NewGuid() }, login.Login.CsrfToken, default))).Error);
        await Database<AuthDbContext, bool>(fixture.Auth.Services, async db => { var user = await db.Users.SingleAsync(x => x.Id == actor.UserId); user.Active = false; await db.SaveChangesAsync(); return true; });
        // A fresh scope prevents a tracked snapshot from substituting for current authority.
        await using (var current = fixture.Auth.Services.CreateAsyncScope()) Assert.Equal(Errors.Unauthenticated,
            (await Assert.ThrowsAsync<AppException>(() => current.ServiceProvider.GetRequiredService<AuthService>().Refresh(login.RefreshToken, login.Login.CsrfToken, default))).Error);
        await Database<AuthDbContext, bool>(fixture.Auth.Services, async db => { var user = await db.Users.SingleAsync(x => x.Id == actor.UserId); user.Active = true; user.EmailVerified = false; await db.SaveChangesAsync(); return true; });
        await using (var current = fixture.Auth.Services.CreateAsyncScope()) Assert.Equal(Errors.Unauthenticated,
            (await Assert.ThrowsAsync<AppException>(() => current.ServiceProvider.GetRequiredService<AuthService>().Refresh(login.RefreshToken, login.Login.CsrfToken, default))).Error);
        await Database<AuthDbContext, bool>(fixture.Auth.Services, async db => { var session = await db.Sessions.SingleAsync(x => x.Id == actor.SessionId); session.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(-1); await db.SaveChangesAsync(); return true; });
        await using (var current = fixture.Auth.Services.CreateAsyncScope()) Assert.Equal(Errors.Unauthenticated,
            (await Assert.ThrowsAsync<AppException>(() => current.ServiceProvider.GetRequiredService<AuthService>().Refresh(login.RefreshToken, login.Login.CsrfToken, default))).Error);
    }
    [IntegrationFact]
    public async Task SessionIntrospectionRejectsUnknownWrongOwnerStaleVersionsAndOversizedBatches()
    {
        var login = await fixture.Register(); var actor = Actor(login);
        await using var scope = fixture.Auth.Services.CreateAsyncScope(); var service = scope.ServiceProvider.GetRequiredService<AuthService>();
        var states = await service.Check([new(actor.SessionId, actor.UserId, actor.SecurityVersion), new(Guid.NewGuid(), actor.UserId, 1),
            new(actor.SessionId, Guid.NewGuid(), 1), new(actor.SessionId, actor.UserId, 999)], default);
        Assert.True(states[0].Active); Assert.All(states.Skip(1), state => Assert.False(state.Active));
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Check(Enumerable.Repeat(new SessionProbe(Guid.NewGuid(), actor.UserId, 1), 1001).ToArray(), default))).Error);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Users(actor, 10, default))).Error);
        var admin = Actor(await fixture.Login());
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Manage(admin, actor.UserId, new("Root", true, "測試不合法管理角色"), default))).Error);
        Assert.Equal(Errors.NotFound, (await Assert.ThrowsAsync<AppException>(() => service.Manage(admin, Guid.NewGuid(), new("User", true, "測試不存在的管理目標"), default))).Error);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Users(admin, 0, default))).Error);
        var config = new ConfigurationBuilder().AddConfiguration(fixture.Auth.Services.GetRequiredService<IConfiguration>()).AddInMemoryCollection(new Dictionary<string, string?> { ["Bootstrap:Email"] = null }).Build();
        await ActivatorUtilities.CreateInstance<AuthService>(scope.ServiceProvider, config).Seed(default);
    }
    [IntegrationFact]
    public async Task ChallengePurposeExpirationLengthAndEmailThrottleAreValidated()
    {
        var login = await fixture.Register();
        await using var scope = fixture.Auth.Services.CreateAsyncScope(); var service = scope.ServiceProvider.GetRequiredService<AuthService>();
        Assert.Equal(Errors.InvalidToken, (await Assert.ThrowsAsync<AppException>(() => service.Verify("", default))).Error);
        Assert.Equal(Errors.InvalidToken, (await Assert.ThrowsAsync<AppException>(() => service.Verify(new string('x', 129), default))).Error);
        await service.SendChallenge(new(login.Login.User.Email), "reset", default);
        var token = await fixture.ChallengeToken(login.Login.User.Email, "重設密碼");
        Assert.Equal(Errors.InvalidToken, (await Assert.ThrowsAsync<AppException>(() => service.Verify(token, default))).Error);
        await Database<AuthDbContext, bool>(fixture.Auth.Services, async db => { foreach (var value in await db.Challenges.Where(x => x.UserId == login.Login.User.Id).ToListAsync()) value.ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1); await db.SaveChangesAsync(); return true; });
        await using var current = fixture.Auth.Services.CreateAsyncScope();
        Assert.Equal(Errors.InvalidToken, (await Assert.ThrowsAsync<AppException>(() => current.ServiceProvider.GetRequiredService<AuthService>().Reset(new(token, Password), default))).Error);
        var missing = new EmailRequest(Guid.NewGuid() + "@example.test");
        for (var i = 0; i < 3; i++) await service.SendChallenge(missing, "verify", default);
        Assert.Equal(Errors.RateLimited, (await Assert.ThrowsAsync<AppException>(() => service.SendChallenge(missing, "verify", default))).Error);
        Assert.Equal(Errors.Credentials, (await Assert.ThrowsAsync<AppException>(() => service.Login(new(Guid.NewGuid() + "@example.test", Password), Guid.NewGuid().ToString(), default))).Error);
    }
    [IntegrationFact]
    public async Task ConcurrentRegistrationUsesDatabaseUniquenessRatherThanOnlyAnExistenceCheck()
    {
        var email = Guid.NewGuid() + "@example.test"; using var client = fixture.Auth.CreateClient();
        var result = await Task.WhenAll(Enumerable.Range(0, 4).Select(_ => client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest(email, Password, "同時註冊測試"))));
        Assert.Single(result, x => x.StatusCode == HttpStatusCode.Accepted); Assert.Equal(3, result.Count(x => x.StatusCode == HttpStatusCode.Conflict));
    }
}
