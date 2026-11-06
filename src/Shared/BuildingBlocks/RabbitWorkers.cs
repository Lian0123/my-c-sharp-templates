using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MicroserviceStarter.Contracts;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace MicroserviceStarter.BuildingBlocks;

public static class RabbitTopology
{
    public const string Exchange = "microservices.events.v1";
    public static Dictionary<string, object?> MainQueueOptions(string queue) => new()
    {
        ["x-queue-type"] = "quorum",
        ["x-delivery-limit"] = 20,
        ["x-dead-letter-exchange"] = "",
        ["x-dead-letter-routing-key"] = queue + ".dead",
        ["x-dead-letter-strategy"] = "at-least-once",
        ["x-overflow"] = "reject-publish"
    };
    public static Dictionary<string, object?> DeadQueueOptions() => new()
    { ["x-queue-type"] = "quorum", ["x-delivery-limit"] = -1 };
    public static ConnectionFactory Factory(IConfiguration config) => new()
    {
        Uri = new Uri(config.GetConnectionString("RabbitMQ") ?? throw new InvalidOperationException("RabbitMQ is required")),
        AutomaticRecoveryEnabled = true,
        TopologyRecoveryEnabled = true,
        RequestedHeartbeat = TimeSpan.FromSeconds(15)
    };
    public static async Task<IChannel> Channel(IConnection connection, CancellationToken ct) =>
        await connection.CreateChannelAsync(new CreateChannelOptions(publisherConfirmationsEnabled: true, publisherConfirmationTrackingEnabled: true), ct);
    public static async Task EnsureSubscribers(IChannel channel, CancellationToken ct)
    {
        await channel.ExchangeDeclareAsync(Exchange, ExchangeType.Topic, true, cancellationToken: ct);
        foreach (var (queue, bindings) in new[]
        {
            ("account.events.v1", new[] { EventTypes.IdentityChanged }),
            ("message.events.v1", new[] { EventTypes.IdentityChanged, EventTypes.ProfileChanged, EventTypes.ChatChanged })
        })
        {
            await channel.QueueDeclareAsync(queue + ".dead", true, false, false, DeadQueueOptions(), cancellationToken: ct);
            await channel.QueueDeclareAsync(queue, true, false, false, MainQueueOptions(queue), cancellationToken: ct);
            foreach (var binding in bindings) await channel.QueueBindAsync(queue, Exchange, binding, cancellationToken: ct);
        }
    }
}

public sealed class OutboxPublisher(IServiceScopeFactory scopes, IConfiguration config, ILogger<OutboxPublisher> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var connection = await RabbitTopology.Factory(config).CreateConnectionAsync(stoppingToken);
                await using var channel = await RabbitTopology.Channel(connection, stoppingToken);
                await RabbitTopology.EnsureSubscribers(channel, stoppingToken);
                while (!stoppingToken.IsCancellationRequested)
                {
                    await using var scope = scopes.CreateAsyncScope();
                    var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
                    await using var transaction = await db.Database.BeginTransactionAsync(stoppingToken);
                    var batch = await db.Outbox.FromSqlRaw("SELECT * FROM \"Outbox\" WHERE \"PublishedAt\" IS NULL ORDER BY \"CreatedAt\" LIMIT 20 FOR UPDATE SKIP LOCKED")
                        .ToListAsync(stoppingToken);
                    foreach (var item in batch)
                    {
                        // A confirm alone also acknowledges unroutable messages: mandatory=true is essential.
                        await channel.BasicPublishAsync(RabbitTopology.Exchange, item.Type, true,
                            new BasicProperties { Persistent = true, ContentType = "application/json", MessageId = item.Id.ToString() },
                            Encoding.UTF8.GetBytes(item.Envelope), stoppingToken);
                        item.PublishedAt = DateTimeOffset.UtcNow;
                    }
                    await db.SaveChangesAsync(stoppingToken);
                    await transaction.CommitAsync(stoppingToken);
                    if (batch.Count == 0) await Task.Delay(500, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex)
            {
                logger.LogWarning("Outbox delivery deferred: {ExceptionType}", ex.GetType().Name);
                await Task.Delay(3000, stoppingToken);
            }
        }
    }
}

public sealed class EventConsumer(IServiceScopeFactory scopes, IConfiguration config, ILogger<EventConsumer> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var connection = await RabbitTopology.Factory(config).CreateConnectionAsync(stoppingToken);
                await using var channel = await RabbitTopology.Channel(connection, stoppingToken);
                var queue = config["ServiceName"]!.ToLowerInvariant() + ".events.v1";
                var deliveryExchange = queue + ".delivery";
                var quorum = new Dictionary<string, object?> { ["x-queue-type"] = "quorum" };
                await channel.ExchangeDeclareAsync(RabbitTopology.Exchange, ExchangeType.Topic, true, cancellationToken: stoppingToken);
                await channel.ExchangeDeclareAsync(deliveryExchange, ExchangeType.Direct, true, cancellationToken: stoppingToken);
                await channel.QueueDeclareAsync(queue + ".dead", true, false, false, RabbitTopology.DeadQueueOptions(), cancellationToken: stoppingToken);
                await channel.QueueDeclareAsync(queue, true, false, false, RabbitTopology.MainQueueOptions(queue), cancellationToken: stoppingToken);
                var retryOptions = new Dictionary<string, object?>(quorum)
                {
                    ["x-message-ttl"] = config.GetValue("Rabbit:RetryDelayMilliseconds", 5000),
                    ["x-dead-letter-exchange"] = deliveryExchange,
                    ["x-dead-letter-routing-key"] = queue,
                    ["x-dead-letter-strategy"] = "at-least-once",
                    ["x-overflow"] = "reject-publish"
                };
                await channel.QueueDeclareAsync(queue + ".retry", true, false, false, retryOptions, cancellationToken: stoppingToken);
                await channel.QueueBindAsync(queue, deliveryExchange, queue, cancellationToken: stoppingToken);
                await using (var setup = scopes.CreateAsyncScope())
                    foreach (var binding in setup.ServiceProvider.GetRequiredService<IIntegrationHandler>().Bindings)
                        await channel.QueueBindAsync(queue, RabbitTopology.Exchange, binding, cancellationToken: stoppingToken);
                await channel.BasicQosAsync(0, 10, false, stoppingToken);
                var consumer = new AsyncEventingBasicConsumer(channel);
                consumer.ReceivedAsync += async (_, message) =>
                {
                    var body = message.Body.ToArray();
                    try
                    {
                        var envelope = Json.Read<IntegrationEvent>(Encoding.UTF8.GetString(body));
                        if (envelope.SchemaVersion != 1 || envelope.EventId == Guid.Empty) throw new InvalidDataException("Unknown event schema");
                        await using var scope = scopes.CreateAsyncScope();
                        var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
                        await using var transaction = await db.Database.BeginTransactionAsync(stoppingToken);
                        // Serialize duplicate deliveries of the same event across replicas.
                        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtext({envelope.EventId.ToString()}))", stoppingToken);
                        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtext({envelope.AggregateId.ToString()}))", stoppingToken);
                        if (!await db.Inbox.AnyAsync(x => x.Id == envelope.EventId, stoppingToken))
                        {
                            await scope.ServiceProvider.GetRequiredService<IIntegrationHandler>().Handle(envelope, stoppingToken);
                            db.Inbox.Add(new() { Id = envelope.EventId, ProcessedAt = DateTimeOffset.UtcNow });
                            await db.SaveChangesAsync(stoppingToken);
                        }
                        await transaction.CommitAsync(stoppingToken);
                        await channel.BasicAckAsync(message.DeliveryTag, false, stoppingToken);
                    }
                    catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                    {
                        var attempts = message.BasicProperties.Headers?.TryGetValue("x-attempt", out var raw) == true ? Convert.ToInt32(raw) : 0;
                        var properties = new BasicProperties
                        {
                            Persistent = true,
                            ContentType = "application/json",
                            MessageId = message.BasicProperties.MessageId,
                            Headers = new Dictionary<string, object?> { ["x-attempt"] = attempts + 1, ["x-failure-type"] = ex.GetType().Name }
                        };
                        await channel.BasicPublishAsync("", queue + (attempts >= 4 ? ".dead" : ".retry"), true, properties, body, stoppingToken);
                        await channel.BasicAckAsync(message.DeliveryTag, false, stoppingToken);
                        logger.LogWarning("Event processing deferred, attempt {Attempt}, failure {Failure}", attempts + 1, ex.GetType().Name);
                    }
                };
                await channel.BasicConsumeAsync(queue, false, consumer, stoppingToken);
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex)
            {
                logger.LogWarning("Consumer reconnecting: {ExceptionType}", ex.GetType().Name);
                await Task.Delay(3000, stoppingToken);
            }
        }
    }
}
