using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.BuildingBlocks;

public sealed class OutboxRecord
{
    public Guid Id { get; set; }
    public string Type { get; set; } = "";
    public string Envelope { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
}

public sealed class InboxRecord
{
    public Guid Id { get; set; }
    public DateTimeOffset ProcessedAt { get; set; }
}

public sealed class AuditRecord
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid ActorId { get; set; }
    public string Action { get; set; } = "";
    public string Target { get; set; } = "";
    public string Reason { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public abstract class PlatformDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<OutboxRecord> Outbox => Set<OutboxRecord>();
    public DbSet<InboxRecord> Inbox => Set<InboxRecord>();
    public DbSet<AuditRecord> Audit => Set<AuditRecord>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<OutboxRecord>().HasIndex(x => new { x.PublishedAt, x.CreatedAt });
        model.Entity<OutboxRecord>().Property(x => x.Envelope).HasColumnType("jsonb");
        model.Entity<AuditRecord>().HasIndex(x => x.CreatedAt);
    }

    public void Enqueue<T>(string type, Guid aggregateId, long version, T payload)
    {
        var envelope = new IntegrationEvent(Guid.CreateVersion7(), type, 1, aggregateId, version,
            DateTimeOffset.UtcNow, Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N"), Json.Write(payload));
        Outbox.Add(new() { Id = envelope.EventId, Type = type, CreatedAt = envelope.OccurredAtUtc, Envelope = Json.Write(envelope) });
    }

    public void Record(Actor actor, string action, string target, string reason) => Audit.Add(new()
    { ActorId = actor.UserId, Action = action, Target = target, Reason = Guard.Reason(reason) });
}

public interface IIntegrationHandler
{
    IReadOnlyList<string> Bindings { get; }
    Task Handle(IntegrationEvent envelope, CancellationToken ct);
}

