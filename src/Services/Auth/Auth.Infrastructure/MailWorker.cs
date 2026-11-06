using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace MicroserviceStarter.Auth.Infrastructure;

public sealed class MailWorker(IServiceScopeFactory scopes, IConfiguration config, IDataProtectionProvider protection, ILogger<MailWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
                await using var transaction = await db.Database.BeginTransactionAsync(stoppingToken);
                var jobs = await db.MailJobs.FromSqlRaw("SELECT * FROM \"MailJobs\" WHERE \"DeliveredAt\" IS NULL ORDER BY \"CreatedAt\" LIMIT 10 FOR UPDATE SKIP LOCKED").ToListAsync(stoppingToken);
                foreach (var job in jobs)
                {
                    var mail = new MimeMessage();
                    mail.From.Add(MailboxAddress.Parse(config["Smtp:From"] ?? "noreply@microservices.local"));
                    mail.To.Add(MailboxAddress.Parse(job.Recipient)); mail.Subject = job.Subject;
                    mail.Body = new TextPart("plain") { Text = protection.CreateProtector("auth-mail-v1").Unprotect(job.ProtectedBody) };
                    using var smtp = new SmtpClient();
                    await smtp.ConnectAsync(config["Smtp:Host"] ?? "mailpit", config.GetValue("Smtp:Port", 1025),
                        config.GetValue("Smtp:StartTls", false) ? SecureSocketOptions.StartTls : SecureSocketOptions.None, stoppingToken);
                    var username = config["Smtp:Username"];
                    if (!string.IsNullOrWhiteSpace(username)) await smtp.AuthenticateAsync(username, config["Smtp:Password"] ?? "", stoppingToken);
                    await smtp.SendAsync(mail, stoppingToken); await smtp.DisconnectAsync(true, stoppingToken);
                    job.DeliveredAt = DateTimeOffset.UtcNow;
                    job.ProtectedBody = "";
                }
                await db.SaveChangesAsync(stoppingToken); await transaction.CommitAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { logger.LogWarning("Mail delivery deferred: {ExceptionType}", ex.GetType().Name); }
            await Task.Delay(2000, stoppingToken);
        }
    }
}
