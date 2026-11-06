using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.Account.Application;
using MicroserviceStarter.Account.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;

var builder = WebApplication.CreateBuilder(args);
builder.AddPlatform("Account"); builder.Services.AddRedis(builder.Configuration);
builder.Services.AddDbContext<AccountDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));
builder.Services.AddScoped<PlatformDbContext>(sp => sp.GetRequiredService<AccountDbContext>());
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IIntegrationHandler, AccountIntegrationHandler>();
builder.Services.AddHostedService<EventConsumer>(); builder.Services.AddHostedService<OutboxPublisher>();
var app = builder.Build();
if (args.Contains("--migrate"))
{ await using var scope = app.Services.CreateAsyncScope(); await scope.ServiceProvider.GetRequiredService<AccountDbContext>().Database.MigrateAsync(); return; }
app.UsePlatform();
app.MapGet("/health/ready", async (AccountDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503)).ExcludeFromDescription();
var api = app.MapGroup("/api/v1/accounts").RequireAuthorization().WithTags("Account");
api.MapGet("/me", async (IAccountService service, HttpContext context, CancellationToken ct) =>
{
    var profile = await service.Me(context.User.Actor(), ct);
    if (profile is not null) return Results.Ok(profile) as IResult;
    context.Response.Headers.RetryAfter = "2";
    return Results.Accepted(value: new { status = "provisioning" });
}).WithSummary("讀取個人資料；初始化中回傳 202").Produces<ProfileView>().Produces(202);
api.MapPut("/me", async (ProfileRequest request, string? reason, IAccountService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Update(context.User.Actor(), context.User.Actor().UserId, request, reason, ct)))
    .WithSummary("編輯個人資料").Produces<ProfileView>();
api.MapGet("/", async (string? search, int? limit, IAccountService service, CancellationToken ct) =>
    Results.Ok(await service.Search(search, limit ?? 50, ct))).WithSummary("搜尋會員公開資料").Produces<ProfileView[]>();
api.MapPut("/admin/{id:guid}", async (Guid id, string reason, ProfileRequest request, IAccountService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Update(context.User.Actor(), id, request, reason, ct))).RequireAuthorization("Admin").WithSummary("管理員編輯會員資料").Produces<ProfileView>();
api.MapGet("/admin/audit", async (int? limit, AccountDbContext db, CancellationToken ct) =>
    Results.Ok(await db.Audit.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(Guard.PageSize(limit ?? 50)).Select(x => new AuditView(x.Id, x.ActorId, x.Action, x.Target, x.Reason, x.CreatedAt)).ToListAsync(ct)))
    .RequireAuthorization("Admin").WithSummary("查詢帳號服務稽核紀錄").Produces<AuditView[]>();
await app.RunAsync();
public partial class Program;
