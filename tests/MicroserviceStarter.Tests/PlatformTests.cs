using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Tests;

public sealed class StubHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> action) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) => action(request, ct);
}
public class PlatformTests
{
    [Fact]
    public async Task RemoteSessionValidationRequiresExplicitSuccessfulAuthoritativeResponses()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        { ["Auth:Url"] = "http://auth", ["ServiceName"] = "Account", ["Internal:AccountKey"] = "test-secret" }).Build();
        var probe = new SessionProbe(Guid.NewGuid(), Guid.NewGuid(), 1);
        using var success = new HttpClient(new StubHandler(async (request, ct) =>
        {
            Assert.Equal("Account", request.Headers.GetValues("X-Service-Id").Single());
            Assert.Equal(probe, (await request.Content!.ReadFromJsonAsync<SessionProbe[]>(ct))!.Single());
            return new(HttpStatusCode.OK) { Content = JsonContent.Create(new[] { new SessionState(probe.SessionId, probe.UserId, true, "User") }) };
        }));
        Assert.True((await new RemoteSessionValidator(success, config).Check([probe], default)).Single().Active);
        using var empty = new HttpClient(new StubHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("null", System.Text.Encoding.UTF8, "application/json") })));
        Assert.Empty(await new RemoteSessionValidator(empty, config).Check([], default));
        foreach (var error in new Exception[] { new HttpRequestException(), new TaskCanceledException(), new JsonException() })
        {
            using var client = new HttpClient(new StubHandler((_, _) => throw error));
            var failure = await Assert.ThrowsAsync<AppException>(() => new RemoteSessionValidator(client, config).Check([probe], default));
            Assert.Equal(Errors.Unavailable, failure.Error);
        }
        using var denied = new HttpClient(new StubHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.Forbidden))));
        Assert.Equal(Errors.Unavailable, (await Assert.ThrowsAsync<AppException>(() => new RemoteSessionValidator(denied, config).Check([probe], default))).Error);
    }
    [Fact]
    public async Task ExceptionBoundaryFormatsHttpErrorsHidesSecretsAndPreservesTraceability()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Production" });
        builder.WebHost.UseTestServer(); builder.AddPlatform("Boundary", false);
        await using var app = builder.Build(); app.UsePlatform();
        static IResult Fail(Exception exception) => throw exception;
        app.MapGet("/fault/unknown", () => Fail(new InvalidOperationException("sensitive-password")));
        app.MapGet("/fault/network", () => Fail(new HttpRequestException("sensitive-password")));
        app.MapGet("/fault/json", () => Fail(new JsonException("sensitive-password")));
        app.MapGet("/fault/size", () => Fail(new BadHttpRequestException("sensitive-password", 413)));
        app.MapGet("/fault/fields", () => Fail(new AppException(Errors.Validation, fields: new Dictionary<string, string[]> { ["field"] = ["缺少欄位"] })));
        app.MapGet("/fault/empty", () => Results.StatusCode(415));
        app.MapGet("/fault/cancel", (HttpContext context) => { context.RequestAborted = new CancellationToken(true); return Fail(new OperationCanceledException()); });
        await app.StartAsync(); using var client = app.GetTestClient();
        foreach (var (path, status) in new[] { ("unknown", 500), ("network", 503), ("json", 400), ("size", 413), ("fields", 400), ("empty", 415) })
        {
            var response = await client.GetAsync("/fault/" + path); Assert.Equal(status, (int)response.StatusCode);
            var raw = await response.Content.ReadAsStringAsync(); Assert.DoesNotContain("sensitive-password", raw);
            var problem = JsonSerializer.Deserialize<ApiProblem>(raw, Json.Options)!;
            Assert.Equal(status.ToString(), problem.ErrorCode[..3]); Assert.Equal("Boundary", problem.Source); Assert.NotEmpty(problem.TraceId);
            if (path == "fields") Assert.Equal("缺少欄位", problem.Errors!["field"].Single());
        }
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/fault/cancel")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/openapi/v1.json")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/errors")).StatusCode);
    }
    [Fact]
    public void ActorsAndInternalCredentialsFailClosed()
    {
        Assert.Throws<AppException>(() => new ClaimsPrincipal().Actor());
        var id = Guid.NewGuid(); var sid = Guid.NewGuid();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([new("sub", id.ToString()), new("sid", sid.ToString()), new("ver", "1")]));
        Assert.Equal(new Actor(id, sid, 1, "User"), principal.Actor());
        foreach (var claims in new[] { new[] { new Claim("sub", id.ToString()) }, new[] { new Claim("sub", id.ToString()), new("sid", sid.ToString()), new("ver", "bad") } }) Assert.Throws<AppException>(() => new ClaimsPrincipal(new ClaimsIdentity(claims)).Actor());
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Internal:AuthKey"] = "valid" }).Build();
        using var services = new ServiceCollection().AddSingleton<IConfiguration>(config).BuildServiceProvider();
        var context = new DefaultHttpContext { RequestServices = services };
        Assert.Throws<AppException>(() => context.RequireInternal()); context.Request.Headers["X-Service-Id"] = "Auth";
        Assert.Throws<AppException>(() => context.RequireInternal()); context.Request.Headers["X-Service-Key"] = "wrong";
        Assert.Throws<AppException>(() => context.RequireInternal()); context.Request.Headers["X-Service-Key"] = "valid"; context.RequireInternal();
        context.Request.Headers["X-Service-Id"] = "Gateway"; Assert.Throws<AppException>(() => context.RequireInternal());
        Assert.Throws<AppException>(() => new EmailRequest("invalid").Validate());
        var error = Assert.Throws<AppException>(() => new InvalidObject().Validate()); Assert.Contains("request", error.Fields!.Keys);
    }
    [Fact]
    public void MigrationFactoriesCreateOnlyTheOwningServiceModel()
    {
        using var auth = new MicroserviceStarter.Auth.Infrastructure.DesignTimeFactory().CreateDbContext([]);
        using var account = new MicroserviceStarter.Account.Infrastructure.DesignTimeFactory().CreateDbContext([]);
        using var message = new MicroserviceStarter.Message.Infrastructure.DesignTimeFactory().CreateDbContext([]);
        Assert.Contains(auth.Model.GetEntityTypes(), x => x.ClrType == typeof(MicroserviceStarter.Auth.Domain.User));
        Assert.DoesNotContain(account.Model.GetEntityTypes(), x => x.ClrType == typeof(MicroserviceStarter.Auth.Domain.User));
        Assert.Contains(message.Model.GetEntityTypes(), x => x.ClrType == typeof(MicroserviceStarter.Message.Domain.Room));
    }
    [InvalidObjectValidation]
    private sealed class InvalidObject;
    private sealed class InvalidObjectValidationAttribute : ValidationAttribute
    { protected override ValidationResult? IsValid(object? value, ValidationContext validationContext) => new(null); }
}
