using System.Text;
using System.Net.Http.Json;
using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MicroserviceStarter.Auth.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Infrastructure;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using static MicroserviceStarter.Tests.IntegrationFixture;

namespace MicroserviceStarter.Tests;

public sealed class RecordingLogger<T> : ILogger<T>
{
    public ConcurrentQueue<string> Messages { get; } = new();
    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
    public bool IsEnabled(LogLevel logLevel) => true;
    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) => Messages.Enqueue(formatter(state, exception));
}
[Collection("Integration")]
public class WorkerIntegrationTests(IntegrationFixture fixture)
{
    [IntegrationFact]
    public async Task EmailJobsAreEncryptedAtRestDeliveredToSmtpAndScrubbedAfterDelivery()
    {
        var email = Guid.NewGuid() + "@example.test"; await fixture.Register(email, false);
        var logger = new RecordingLogger<MailWorker>();
        using var worker = ActivatorUtilities.CreateInstance<MailWorker>(fixture.Auth.Services, logger);
        await worker.StartAsync(default);
        try { await Wait(async () => await Database<AuthDbContext, bool>(fixture.Auth.Services, db => db.MailJobs.AnyAsync(x => x.Recipient == email && x.DeliveredAt != null && x.ProtectedBody == ""))); }
        finally { await worker.StopAsync(default); }
        var config = new ConfigurationBuilder().AddConfiguration(fixture.Auth.Services.GetRequiredService<IConfiguration>()).AddInMemoryCollection(new Dictionary<string, string?> { ["Smtp:Port"] = "1" }).Build();
        await fixture.Register(Guid.NewGuid() + "@example.test", false);
        using var failing = ActivatorUtilities.CreateInstance<MailWorker>(fixture.Auth.Services, config, logger);
        await failing.StartAsync(default);
        try { await Wait(() => Task.FromResult(logger.Messages.Any(x => x.Contains("deferred", StringComparison.Ordinal)))); }
        finally { await failing.StopAsync(default); }
    }
    [IntegrationFact]
    public async Task PoisonEventsRetryThenMoveToTheDeadLetterQueueWithoutBeingMarkedProcessed()
    {
        var config = fixture.Message.Services.GetRequiredService<IConfiguration>();
        await using var connection = await RabbitTopology.Factory(config).CreateConnectionAsync();
        await using var channel = await RabbitTopology.Channel(connection, default);
        var poison = new IntegrationEvent(Guid.NewGuid(), EventTypes.ProfileChanged, 99, Guid.NewGuid(), 1, DateTimeOffset.UtcNow, "integration", "{}");
        await channel.BasicPublishAsync("", "message.events.v1", true, new BasicProperties { Persistent = true, MessageId = poison.EventId.ToString() }, Encoding.UTF8.GetBytes(Json.Write(poison)));
        BasicGetResult? dead = null;
        await Wait(async () => { dead = await channel.BasicGetAsync("message.events.v1.dead", true); return dead is not null; });
        Assert.Equal(poison.EventId.ToString(), dead!.BasicProperties.MessageId); Assert.True(Convert.ToInt32(dead.BasicProperties.Headers!["x-attempt"]) >= 5);
        Assert.False(await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Inbox.AnyAsync(x => x.Id == poison.EventId)));
    }
    [IntegrationFact]
    public async Task MissingBrokerNeverMarksOutboxRowsPublishedAndWorkersCanStopDuringRecovery()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["ConnectionStrings:RabbitMQ"] = "://invalid" }).Build();
        var publisherLog = new RecordingLogger<OutboxPublisher>(); var consumerLog = new RecordingLogger<EventConsumer>();
        using var publisher = ActivatorUtilities.CreateInstance<OutboxPublisher>(fixture.Auth.Services, config, publisherLog);
        using var consumer = ActivatorUtilities.CreateInstance<EventConsumer>(fixture.Message.Services, config, consumerLog);
        await publisher.StartAsync(default); await consumer.StartAsync(default);
        await Wait(() => Task.FromResult(publisherLog.Messages.Count > 0 && consumerLog.Messages.Count > 0));
        await publisher.StopAsync(default); await consumer.StopAsync(default);
        Assert.Contains("deferred", publisherLog.Messages.First()); Assert.Contains("reconnecting", consumerLog.Messages.First());
    }
    [IntegrationFact]
    public async Task UnboundEventsRemainInTheTransactionalOutboxForOperatorRecovery()
    {
        var id = await Database<AuthDbContext, Guid>(fixture.Auth.Services, async db =>
        { db.Enqueue("unknown.unbound.v1", Guid.NewGuid(), 1, new { value = "test" }); var row = db.Outbox.Local.Single(); await db.SaveChangesAsync(); return row.Id; });
        await Task.Delay(1200);
        Assert.True(await Database<AuthDbContext, bool>(fixture.Auth.Services, db => db.Outbox.AnyAsync(x => x.Id == id && x.PublishedAt == null)));
        await Database<AuthDbContext, bool>(fixture.Auth.Services, async db => { await db.Outbox.Where(x => x.Id == id).ExecuteDeleteAsync(); return true; });
    }
    [IntegrationFact]
    public async Task AttachmentCleanupDeletesExpiredUnboundObjectsAndDatabaseReferences()
    {
        var user = await fixture.Register(); await Wait(async () => await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Users.AnyAsync(x => x.Id == user.Login.User.Id)));
        using var client = fixture.Client(fixture.Message, user);
        var response = await client.PostAsJsonAsync("/api/v1/chat/rooms", new MicroserviceStarter.Message.Application.RoomRequest("清理測試", []));
        var room = (await response.Content.ReadFromJsonAsync<MicroserviceStarter.Message.Application.RoomView>())!;
        using var data = new MultipartFormDataContent(); var content = new ByteArrayContent("expired"u8.ToArray()); content.Headers.ContentType = new("text/plain"); data.Add(content, "file", "expired.txt");
        var uploaded = await client.PostAsync($"/api/v1/chat/rooms/{room.Id}/attachments", data);
        var attachment = (await uploaded.Content.ReadFromJsonAsync<MicroserviceStarter.Message.Application.AttachmentView>())!;
        await Database<MessageDbContext, bool>(fixture.Message.Services, async db => { var file = await db.Attachments.SingleAsync(x => x.Id == attachment.Id); file.CreatedAt = DateTimeOffset.UtcNow.AddHours(-25); await db.SaveChangesAsync(); return true; });
        using var worker = ActivatorUtilities.CreateInstance<AttachmentCleanup>(fixture.Message.Services);
        await worker.StartAsync(default);
        try { await Wait(async () => !await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Attachments.AnyAsync(x => x.Id == attachment.Id))); }
        finally { await worker.StopAsync(default); }
        Assert.Equal(System.Net.HttpStatusCode.NotFound, (await client.GetAsync("/api/v1/chat/attachments/" + attachment.Id)).StatusCode);
    }
}
