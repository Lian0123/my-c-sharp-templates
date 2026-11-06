using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MicroserviceStarter.Message.Infrastructure;

public sealed class AttachmentCleanup(IServiceScopeFactory scopes, ILogger<AttachmentCleanup> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<MessageDbContext>();
                await using var transaction = await db.Database.BeginTransactionAsync(stoppingToken);
                var expired = DateTimeOffset.UtcNow.AddHours(-24);
                var files = await db.Attachments.FromSqlInterpolated($"SELECT * FROM \"Attachments\" WHERE \"MessageId\" IS NULL AND \"CreatedAt\" < {expired} LIMIT 100 FOR UPDATE SKIP LOCKED").ToListAsync(stoppingToken);
                foreach (var file in files)
                { await scope.ServiceProvider.GetRequiredService<IObjectStorage>().Delete(file.ObjectKey, stoppingToken); db.Attachments.Remove(file); }
                await db.SaveChangesAsync(stoppingToken); await transaction.CommitAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { logger.LogWarning("Attachment cleanup deferred: {ExceptionType}", ex.GetType().Name); }
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}
