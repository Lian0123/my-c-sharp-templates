using System.Net.Http.Json;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using Yarp.ReverseProxy.Forwarder;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.AddPlatform("Gateway", onlineValidation: false);
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 21 * 1024 * 1024);
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
builder.Services.AddHttpClient("health", client => client.Timeout = TimeSpan.FromSeconds(3));
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        !context.Request.Path.StartsWithSegments("/api") && !context.Request.Path.StartsWithSegments("/hubs")
            ? RateLimitPartition.GetNoLimiter("static")
            : RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new()
            { PermitLimit = builder.Configuration.GetValue("RateLimit:RequestsPerMinute", 300), Window = TimeSpan.FromMinutes(1), QueueLimit = 0, AutoReplenishment = true }));
    options.OnRejected = async (context, _) =>
    {
        await Platform.WriteProblem(context.HttpContext, Errors.RateLimited);
    };
});
var app = builder.Build();
app.UsePlatform();
app.UseRateLimiter();
app.MapGet("/health/ready", () => Results.Ok(new { status = "ready" })).ExcludeFromDescription();
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/internal")) { await Platform.WriteProblem(context, Errors.NotFound); return; }
    await next();
    var feature = context.GetForwarderErrorFeature();
    if (feature is not null && !context.Response.HasStarted)
        await Platform.WriteProblem(context, feature.Error.ToString().Contains("Timeout", StringComparison.Ordinal) ? Errors.Timeout : Errors.Upstream);
});
if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("OpenApi:Enabled"))
    app.UseSwaggerUI(options =>
    {
        options.RoutePrefix = "docs";
        foreach (var service in new[] { "auth", "account", "message" }) options.SwaggerEndpoint($"/openapi/{service}/v1.json", service);
    });
app.MapGet("/api/v1/system/status", async (HttpContext context, ISessionValidator validator, IHttpClientFactory factory, CancellationToken ct) =>
{
    var actor = context.User.Actor();
    if (!(await validator.Check([new(actor.SessionId, actor.UserId, actor.SecurityVersion)], ct)).Any(x => x.Active && x.Role == "Admin")) throw new AppException(Errors.Forbidden);
    var result = new Dictionary<string, object>();
    foreach (var service in new[] { "auth", "account", "message" })
    {
        try
        {
            using var response = await factory.CreateClient("health").GetAsync($"http://{service}:8080/health/ready", ct);
            result[service] = new { ready = response.IsSuccessStatusCode };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException) { result[service] = new { ready = false }; }
    }
    return Results.Ok(result);
}).RequireAuthorization("Admin").WithSummary("查詢各服務狀態");
app.MapReverseProxy();
app.MapFallback("/api/{**path}", (HttpContext context) => Platform.WriteProblem(context, Errors.NotFound));
await app.RunAsync();
public partial class Program;
