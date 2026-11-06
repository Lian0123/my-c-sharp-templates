using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.Auth.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Tests;

[Collection("Integration")]
public class AuthIntegrationTests(IntegrationFixture fixture)
{
    [IntegrationFact]
    public async Task RegistrationVerificationLoginAndImmediateLogoutAreEnforcedAcrossServices()
    {
        var login = await fixture.Register();
        using var account = fixture.Client(fixture.Account, login);
        await IntegrationFixture.Wait(async () => (await account.GetAsync("/api/v1/accounts/me")).StatusCode == HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.NoContent, (await login.Client.PostAsync("/api/v1/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await account.GetAsync("/api/v1/accounts/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await login.Client.GetAsync("/api/v1/auth/me")).StatusCode);
    }
    [IntegrationFact]
    public async Task RefreshRotatesCookiesAndReusingOldTokenRevokesItsFamily()
    {
        var login = await fixture.Register();
        var response = await login.Client.PostAsync("/api/v1/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var rotated = (await response.Content.ReadFromJsonAsync<LoginResult>())!;
        Assert.NotEqual(login.Login.AccessToken, rotated.AccessToken);
        using var replay = fixture.Auth.CreateClient(new() { HandleCookies = false });
        replay.DefaultRequestHeaders.Add("Cookie", $"refresh_token={login.RefreshToken}; csrf_token={login.Login.CsrfToken}");
        replay.DefaultRequestHeaders.Add("X-CSRF-Token", login.Login.CsrfToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await replay.PostAsync("/api/v1/auth/refresh", null)).StatusCode);
        replay.DefaultRequestHeaders.Authorization = new("Bearer", rotated.AccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await replay.GetAsync("/api/v1/auth/me")).StatusCode);
    }
    [IntegrationFact]
    public async Task PasswordResetTokensAreSingleUseAndRevokeEverySession()
    {
        var login = await fixture.Register();
        Assert.Equal(HttpStatusCode.Accepted, (await login.Client.PostAsJsonAsync("/api/v1/auth/forgot-password", new EmailRequest(login.Login.User.Email))).StatusCode);
        var token = await fixture.ChallengeToken(login.Login.User.Email, "重設密碼");
        Assert.Equal(HttpStatusCode.NoContent, (await login.Client.PostAsJsonAsync("/api/v1/auth/reset", new ResetRequest(token, IntegrationFixture.Password + "new"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await login.Client.GetAsync("/api/v1/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await login.Client.PostAsJsonAsync("/api/v1/auth/reset", new ResetRequest(token, IntegrationFixture.Password))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await login.Client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(login.Login.User.Email, IntegrationFixture.Password))).StatusCode);
        using var changed = (await fixture.Login(login.Login.User.Email, IntegrationFixture.Password + "new")).Client;
        Assert.Equal(HttpStatusCode.OK, (await changed.GetAsync("/api/v1/auth/me")).StatusCode);
    }
    [IntegrationFact]
    public async Task AdminRoleChangesRevokeAccessAndProtectTheLastAdministrator()
    {
        var admin = await fixture.Login(); var login = await fixture.Register();
        var url = "/api/v1/auth/admin/users/" + login.Login.User.Id;
        Assert.Equal(HttpStatusCode.Forbidden, (await login.Client.GetAsync("/api/v1/auth/admin/users")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await admin.Client.PutAsJsonAsync(url, new ManageUserRequest("Admin", true, "測試管理員權限調整"))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await login.Client.GetAsync("/api/v1/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await admin.Client.PutAsJsonAsync(url, new ManageUserRequest("User", false, "測試帳號停用操作"))).StatusCode);
        var last = await admin.Client.PutAsJsonAsync("/api/v1/auth/admin/users/" + admin.Login.User.Id, new ManageUserRequest("User", false, "測試最後管理員保護"));
        Assert.Equal(HttpStatusCode.Conflict, last.StatusCode);
        Assert.Equal("4091002", (await last.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>())!["errorCode"]!.GetValue<string>());
        Assert.Equal(HttpStatusCode.OK, (await admin.Client.GetAsync("/api/v1/auth/admin/audit")).StatusCode);
    }
    [IntegrationFact]
    public async Task InvalidInputsCsrfExpiredChallengesAndLoginLockoutReturnStructuredErrors()
    {
        using var client = fixture.Auth.CreateClient();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest("bad", "short", ""))).StatusCode);
        var login = await fixture.Register();
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest(login.Login.User.Email.ToUpperInvariant(), IntegrationFixture.Password, "重複會員"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/verify", new TokenRequest("invalid"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsync("/api/v1/auth/refresh", null)).StatusCode);
        login.Client.DefaultRequestHeaders.Remove("X-CSRF-Token");
        Assert.Equal(HttpStatusCode.Forbidden, (await login.Client.PostAsync("/api/v1/auth/logout", null)).StatusCode);
        for (var i = 0; i < 5; i++) Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(login.Login.User.Email, "incorrect"))).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(login.Login.User.Email, IntegrationFixture.Password))).StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, (await client.PostAsJsonAsync("/api/v1/auth/forgot-password", new EmailRequest("missing-" + Guid.NewGuid() + "@example.test"))).StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, (await client.PostAsJsonAsync("/api/v1/auth/resend-verification", new EmailRequest(login.Login.User.Email))).StatusCode);
        await IntegrationFixture.Database<AuthDbContext, bool>(fixture.Auth.Services, async db => { foreach (var c in await db.Challenges.Where(x => x.UserId == login.Login.User.Id).ToListAsync()) c.ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1); await db.SaveChangesAsync(); return true; });
    }
    [IntegrationFact]
    public async Task UnverifiedUsersCannotLoginAndVerificationLinksCannotBeReused()
    {
        var email = Guid.NewGuid() + "@example.test";
        await fixture.Register(email, false);
        using var client = fixture.Auth.CreateClient();
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, IntegrationFixture.Password))).StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, (await client.PostAsJsonAsync("/api/v1/auth/resend-verification", new EmailRequest(email))).StatusCode);
        var token = await fixture.ChallengeToken(email, "驗證您的 Email");
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/verify", new TokenRequest(token))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/verify", new TokenRequest(token))).StatusCode);
    }
}
