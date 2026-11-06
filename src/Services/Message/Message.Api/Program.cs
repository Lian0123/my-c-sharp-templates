using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Api;
using MicroserviceStarter.Message.Application;
using MicroserviceStarter.Message.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.AddPlatform("Message"); builder.Services.AddRedis(builder.Configuration);
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 21 * 1024 * 1024);
builder.Services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = 21 * 1024 * 1024);
builder.Services.AddDbContext<MessageDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));
builder.Services.AddScoped<PlatformDbContext>(sp => sp.GetRequiredService<MessageDbContext>());
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IIntegrationHandler, MessageIntegrationHandler>();
builder.Services.AddScoped<IChatNotifier, ChatNotifier>();
builder.Services.AddSingleton<ConnectionRegistry>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<ConnectionRegistry>());
builder.Services.AddSignalR(o => o.MaximumReceiveMessageSize = 4096).AddStackExchangeRedis(options =>
    options.Configuration = StackExchange.Redis.ConfigurationOptions.Parse(builder.Configuration.GetConnectionString("Redis")
        ?? throw new InvalidOperationException("Redis connection is required")));
builder.Services.AddSingleton<IAmazonS3>(_ => new AmazonS3Client(new BasicAWSCredentials(builder.Configuration["S3:AccessKey"], builder.Configuration["S3:SecretKey"]), new AmazonS3Config
{
    ServiceURL = builder.Configuration["S3:Endpoint"],
    ForcePathStyle = true,
    AuthenticationRegion = "garage",
    RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
    ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED
}));
builder.Services.AddScoped<IObjectStorage, ObjectStorage>();
builder.Services.AddHostedService<EventConsumer>(); builder.Services.AddHostedService<OutboxPublisher>();
builder.Services.AddHostedService<AttachmentCleanup>();
var app = builder.Build();
if (args.Contains("--migrate"))
{ await using var scope = app.Services.CreateAsyncScope(); await scope.ServiceProvider.GetRequiredService<MessageDbContext>().Database.MigrateAsync(); return; }
app.UsePlatform();
app.MapHub<ChatHub>("/hubs/chat", options => options.CloseOnAuthenticationExpiration = true);
app.MapPost("/internal/sessions/revoke", async (HttpContext context, Guid[] ids, ConnectionRegistry registry) =>
{ context.RequireInternal(); await registry.Revoke(ids); return Results.NoContent(); }).ExcludeFromDescription();
app.MapGet("/health/ready", async (MessageDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503)).ExcludeFromDescription();
var api = app.MapGroup("/api/v1/chat").RequireAuthorization().WithTags("Message");
api.MapGet("/rooms", async (IChatService service, HttpContext context, CancellationToken ct) => Results.Ok(await service.Rooms(context.User.Actor(), false, ct)))
    .WithSummary("列出我的聊天室、未讀及在線狀態").Produces<RoomView[]>();
api.MapPost("/rooms", async (RoomRequest request, IChatService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Create(context.User.Actor(), request, ct))).WithSummary("建立群組聊天室").Produces<RoomView>();
api.MapPost("/direct", async (DirectRequest request, IChatService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Direct(context.User.Actor(), request.UserId, ct))).WithSummary("取得或建立一對一聊天室").Produces<RoomView>();
api.MapGet("/rooms/{id:guid}/messages", async (Guid id, long? before, long? after, int? limit, string? reason, IChatService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.History(context.User.Actor(), id, before, after, limit ?? 50, reason, ct))).WithSummary("分頁讀取歷史訊息或重連補齊").Produces<Page<MessageView>>();
api.MapPost("/rooms/{id:guid}/messages", async (Guid id, SendRequest request, IChatService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Send(context.User.Actor(), id, request, ct))).WithSummary("傳送訊息，clientMessageId 提供冪等保護").Produces<MessageView>();
api.MapPut("/rooms/{id:guid}/read", async (Guid id, ReadRequest request, IChatService service, HttpContext context, CancellationToken ct) =>
{ await service.Read(context.User.Actor(), id, request.Sequence, ct); return Results.NoContent(); }).WithSummary("更新已讀位置").Produces(204);
api.MapPut("/rooms/{id:guid}/members", async (Guid id, MemberRequest request, string? reason, IChatService service, HttpContext context, CancellationToken ct) =>
{ await service.Members(context.User.Actor(), id, request, false, reason, ct); return Results.NoContent(); }).WithSummary("新增成員或修改成員角色").Produces(204);
api.MapDelete("/rooms/{id:guid}/members/{userId:guid}", async (Guid id, Guid userId, string? reason, IChatService service, HttpContext context, CancellationToken ct) =>
{ await service.Members(context.User.Actor(), id, new(userId, "Member"), true, reason, ct); return Results.NoContent(); }).WithSummary("移除成員或退出群組").Produces(204);
api.MapPut("/rooms/{id:guid}/owner", async (Guid id, TransferRequest request, IChatService service, HttpContext context, CancellationToken ct) =>
{ await service.Transfer(context.User.Actor(), id, request.UserId, ct); return Results.NoContent(); }).WithSummary("移轉群組擁有權").Produces(204);
api.MapPost("/rooms/{id:guid}/attachments", async (Guid id, IFormFile file, IChatService service, HttpContext context, CancellationToken ct) =>
{ await using var stream = file.OpenReadStream(); return Results.Ok(await service.Upload(context.User.Actor(), id, file.FileName, file.ContentType, stream, ct)); })
    .DisableAntiforgery().WithSummary("上傳附件，每檔最多 20 MiB").Produces<AttachmentView>();
api.MapGet("/attachments/{id:guid}", async (Guid id, string? reason, IChatService service, HttpContext context, CancellationToken ct) =>
{
    var file = await service.Download(context.User.Actor(), id, reason, ct);
    context.Response.Headers.CacheControl = "no-store";
    return Results.File(file.Stream, file.ContentType, file.FileName);
}).WithSummary("驗證權限後下載附件").Produces(200);
api.MapGet("/admin/rooms", async (string reason, IChatService service, MessageDbContext db, HttpContext context, CancellationToken ct) =>
{ db.Record(context.User.Actor(), "rooms.list", "all", reason); await db.SaveChangesAsync(ct); return Results.Ok(await service.Rooms(context.User.Actor(), true, ct)); })
    .RequireAuthorization("Admin").WithSummary("管理員列出聊天室").Produces<RoomView[]>();
api.MapDelete("/admin/rooms/{id:guid}/messages/{messageId:guid}", async (Guid id, Guid messageId, string reason, IChatService service, HttpContext context, CancellationToken ct) =>
{ await service.Moderate(context.User.Actor(), id, messageId, reason, ct); return Results.NoContent(); }).RequireAuthorization("Admin").WithSummary("管理員移除訊息").Produces(204);
api.MapGet("/admin/attachments", async (string reason, int? limit, IChatService service, HttpContext context, CancellationToken ct) =>
    Results.Ok(await service.Attachments(context.User.Actor(), reason, limit ?? 50, ct))).RequireAuthorization("Admin").WithSummary("管理員檢視附件").Produces<AttachmentView[]>();
api.MapGet("/admin/audit", async (int? limit, MessageDbContext db, CancellationToken ct) =>
    Results.Ok(await db.Audit.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(Guard.PageSize(limit ?? 50)).Select(x => new AuditView(x.Id, x.ActorId, x.Action, x.Target, x.Reason, x.CreatedAt)).ToListAsync(ct)))
    .RequireAuthorization("Admin").WithSummary("查詢聊天管理稽核紀錄").Produces<AuditView[]>();
await app.RunAsync();
public partial class Program;
