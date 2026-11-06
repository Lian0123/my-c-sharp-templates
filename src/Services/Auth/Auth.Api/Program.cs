using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.Auth.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;

var builder = WebApplication.CreateBuilder(args);
builder.AddPlatform("Auth");
builder.Services.AddRedis(builder.Configuration);
builder.Services.AddDbContext<AuthDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));
builder.Services.AddScoped<PlatformDbContext>(sp => sp.GetRequiredService<AuthDbContext>());
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IAuthService>(sp => sp.GetRequiredService<AuthService>());
builder.Services.AddScoped<ISessionValidator>(sp => sp.GetRequiredService<AuthService>());
builder.Services.AddDataProtection().SetApplicationName("MicroserviceStarter.Auth");
builder.Services.Configure<Microsoft.AspNetCore.DataProtection.KeyManagement.KeyManagementOptions>(options =>
    options.XmlRepository = new Microsoft.AspNetCore.DataProtection.Repositories.FileSystemXmlRepository(
        new DirectoryInfo(builder.Configuration["DataProtection:Path"] ?? "/data/keys"),
        Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance));
builder.Services.AddHostedService<OutboxPublisher>();
builder.Services.AddHostedService<MailWorker>();
var app = builder.Build();
if (args.Contains("--migrate"))
{
    await using var scope = app.Services.CreateAsyncScope();
    await scope.ServiceProvider.GetRequiredService<AuthDbContext>().Database.MigrateAsync();
    await scope.ServiceProvider.GetRequiredService<AuthService>().Seed(CancellationToken.None);
    return;
}
app.UsePlatform();
app.MapGet("/health/ready", async (AuthDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503)).ExcludeFromDescription();
app.MapPost("/internal/sessions/check", async (HttpContext context, SessionProbe[] probes, ISessionValidator sessions, CancellationToken ct) =>
{ context.RequireInternal(); return Results.Ok(await sessions.Check(probes, ct)); }).ExcludeFromDescription();
var api = app.MapGroup("/api/v1/auth").WithTags("Auth");
api.MapPost("/register", async (RegisterRequest request, IAuthService service, CancellationToken ct) =>
    Results.Accepted(value: new { userId = await service.Register(request, ct), status = "pendingEmailVerification" }))
    .WithSummary("註冊並寄送驗證信").Produces(202).ProducesProblem(400).ProducesProblem(409);
api.MapPost("/login", async (LoginRequest request, IAuthService service, HttpContext context, CancellationToken ct) =>
{
    var forwarded = context.Request.Headers["X-Forwarded-For"].ToString().Split(',').LastOrDefault()?.Trim();
    var result = await service.Login(request, string.IsNullOrEmpty(forwarded) ? context.Connection.RemoteIpAddress?.ToString() ?? "unknown" : forwarded, ct);
    SetCookies(context, result); return Results.Ok(result.Login);
}).WithSummary("登入並建立 Session").Produces<LoginResult>().ProducesProblem(401).ProducesProblem(403).ProducesProblem(429);
api.MapPost("/refresh", async (IAuthService service, HttpContext context, CancellationToken ct) =>
{
    var result = await service.Refresh(context.Request.Cookies["refresh_token"] ?? "", Csrf(context), ct);
    SetCookies(context, result); return Results.Ok(result.Login);
}).WithSummary("輪替 Refresh Token").Produces<LoginResult>().ProducesProblem(401).ProducesProblem(403);
api.MapPost("/logout", async (IAuthService service, HttpContext context, CancellationToken ct) =>
{
    await service.Logout(context.User.Actor(), Csrf(context), ct);
    context.Response.Cookies.Delete("refresh_token", new CookieOptions { Path = "/api/v1/auth" });
    context.Response.Cookies.Delete("csrf_token", new CookieOptions { Path = "/" });
    return Results.NoContent();
}).RequireAuthorization().WithSummary("登出並撤銷登入").Produces(204);
api.MapPost("/verify", async (TokenRequest request, IAuthService service, CancellationToken ct) =>
{ request.Validate(); await service.Verify(request.Token, ct); return Results.NoContent(); }).WithSummary("驗證 Email").Produces(204);
api.MapPost("/resend-verification", async (EmailRequest request, IAuthService service, CancellationToken ct) =>
{ await service.SendChallenge(request, "verify", ct); return Results.Accepted(); }).WithSummary("重寄驗證信").Produces(202);
api.MapPost("/forgot-password", async (EmailRequest request, IAuthService service, CancellationToken ct) =>
{ await service.SendChallenge(request, "reset", ct); return Results.Accepted(); }).WithSummary("寄送密碼重設信").Produces(202);
api.MapPost("/reset", async (ResetRequest request, IAuthService service, CancellationToken ct) =>
{ await service.Reset(request, ct); return Results.NoContent(); }).WithSummary("重設密碼並撤銷所有登入").Produces(204);
api.MapGet("/me", (HttpContext context) => Results.Ok(context.User.Actor())).RequireAuthorization().WithSummary("查詢目前登入狀態").Produces<Actor>();
api.MapGet("/admin/users", async (int? limit, IAuthService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Users(context.User.Actor(), limit ?? 100, ct))).RequireAuthorization("Admin").WithSummary("管理員列出帳號").Produces<UserView[]>();
api.MapPut("/admin/users/{id:guid}", async (Guid id, ManageUserRequest request, IAuthService service, HttpContext context, CancellationToken ct) =>
{ await service.Manage(context.User.Actor(), id, request, ct); return Results.NoContent(); }).RequireAuthorization("Admin").WithSummary("變更角色或停用帳號").Produces(204);
api.MapGet("/admin/audit", async (int? limit, AuthDbContext db, CancellationToken ct) =>
    Results.Ok(await db.Audit.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(Guard.PageSize(limit ?? 50)).Select(x => new AuditView(x.Id, x.ActorId, x.Action, x.Target, x.Reason, x.CreatedAt)).ToListAsync(ct)))
    .RequireAuthorization("Admin").WithSummary("查詢驗證服務稽核紀錄").Produces<AuditView[]>();
await app.RunAsync();

static string Csrf(HttpContext context)
{
    var token = context.Request.Headers["X-CSRF-Token"].ToString();
    if (string.IsNullOrEmpty(token) || token != context.Request.Cookies["csrf_token"]) throw new AppException(Errors.Forbidden, "CSRF 驗證失敗");
    return token;
}
static void SetCookies(HttpContext context, SessionResult result)
{
    var secure = !context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment();
    context.Response.Cookies.Append("refresh_token", result.RefreshToken,
        new() { HttpOnly = true, Secure = secure, SameSite = SameSiteMode.Strict, Path = "/api/v1/auth", Expires = result.ExpiresAt });
    context.Response.Cookies.Append("csrf_token", result.Login.CsrfToken,
        new() { HttpOnly = false, Secure = secure, SameSite = SameSiteMode.Strict, Path = "/", Expires = result.ExpiresAt });
    context.Response.Headers.CacheControl = "no-store";
}
public partial class Program;
