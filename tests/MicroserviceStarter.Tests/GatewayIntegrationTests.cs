extern alias GatewayApi;
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Http;
using MicroserviceStarter.Auth.Application;
using Yarp.ReverseProxy.Forwarder;

namespace MicroserviceStarter.Tests;

public sealed class RoutingHandler(Dictionary<string, HttpMessageInvoker> targets) : HttpMessageHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        if (request.RequestUri!.AbsolutePath.EndsWith("/simulate-failure", StringComparison.Ordinal)) throw new HttpRequestException("Simulated upstream failure");
        if (request.RequestUri.AbsolutePath == "/health/ready" && request.RequestUri.Host == "message") return new(HttpStatusCode.ServiceUnavailable);
        if (targets.TryGetValue(request.RequestUri.Host, out var target)) return await target.SendAsync(request, ct);
        return new(HttpStatusCode.OK) { Content = new StringContent("<html>Relay</html>", System.Text.Encoding.UTF8, "text/html") };
    }
}
public sealed class TestForwarderClientFactory(Dictionary<string, HttpMessageInvoker> targets) : IForwarderHttpClientFactory
{
    public HttpMessageInvoker CreateClient(ForwarderHttpClientContext context) => new(new RoutingHandler(targets));
}
[Collection("Integration")]
public class GatewayIntegrationTests(IntegrationFixture fixture)
{
    [IntegrationFact]
    public async Task GatewayRoutesPublicAndProtectedApisHidesInternalEndpointsAndReportsUpstreamErrors()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:PublicKeyPath"] = Path.Combine(ArchitectureTests.Root, ".local/keys/public.pem"),
            ["Auth:Url"] = "http://auth:8080",
            ["Internal:GatewayKey"] = fixture.Env["INTERNAL_GATEWAY_KEY"]
        };
        using var auth = new HttpMessageInvoker(fixture.Auth.Server.CreateHandler());
        using var account = new HttpMessageInvoker(fixture.Account.Server.CreateHandler());
        using var message = new HttpMessageInvoker(fixture.Message.Server.CreateHandler());
        var targets = new Dictionary<string, HttpMessageInvoker> { ["auth"] = auth, ["account"] = account, ["message"] = message };
        await using var basis = new TestFactory<GatewayApi::Program>(settings);
        await using var gateway = basis.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IForwarderHttpClientFactory>(); services.AddSingleton<IForwarderHttpClientFactory>(new TestForwarderClientFactory(targets));
            services.ConfigureAll<HttpClientFactoryOptions>(options => options.HttpMessageHandlerBuilderActions.Add(b => b.PrimaryHandler = new RoutingHandler(targets)));
        }));
        using var client = gateway.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/ready")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/internal/sessions/check")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/missing")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/accounts/me")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/openapi/auth/v1.json")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/docs/index.html")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/")).StatusCode);
        Assert.Equal(HttpStatusCode.BadGateway, (await client.GetAsync("/api/v1/auth/simulate-failure")).StatusCode);
        var admin = await fixture.Login(); client.DefaultRequestHeaders.Authorization = new("Bearer", admin.Login.AccessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/v1/system/status")).StatusCode);
        var member = await fixture.Register(); client.DefaultRequestHeaders.Authorization = new("Bearer", member.Login.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/system/status")).StatusCode);
        var response = await client.GetAsync("/api/v1/chat/rooms"); Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [IntegrationFact]
    public async Task GatewayRateLimitsApisWithoutBlockingStaticAssetsAndHealthChecks()
    {
        await using var basis = new TestFactory<GatewayApi::Program>(new()
        { ["RateLimit:RequestsPerMinute"] = "1", ["Jwt:PublicKeyPath"] = Path.Combine(ArchitectureTests.Root, ".local/keys/public.pem") });
        await using var gateway = basis.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        { services.RemoveAll<IForwarderHttpClientFactory>(); services.AddSingleton<IForwarderHttpClientFactory>(new TestForwarderClientFactory([])); }));
        using var client = gateway.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("rate@example.test", "not-forwarded-test"))).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("rate@example.test", "not-forwarded-test"))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/ready")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/")).StatusCode);
    }
}
