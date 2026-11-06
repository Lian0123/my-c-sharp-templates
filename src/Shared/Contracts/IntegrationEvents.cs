namespace MicroserviceStarter.Contracts;

public sealed record IntegrationEvent(Guid EventId, string Type, int SchemaVersion, Guid AggregateId,
    long AggregateVersion, DateTimeOffset OccurredAtUtc, string TraceId, string Payload);
public sealed record IdentityChanged(Guid UserId, string DisplayName, bool Active, long Version);
public sealed record ProfileChanged(Guid UserId, string DisplayName, string Bio, bool Active, long Version);
public sealed record ChatChanged(Guid RoomId, Guid MessageId, long Sequence);
public sealed record SessionProbe(Guid SessionId, Guid UserId, long SecurityVersion);
public sealed record SessionState(Guid SessionId, Guid UserId, bool Active, string Role);
public sealed record Actor(Guid UserId, Guid SessionId, long SecurityVersion, string Role)
{
    public bool IsAdmin => Role == "Admin";
}
public sealed record AuditView(Guid Id, Guid ActorId, string Action, string Target, string Reason, DateTimeOffset CreatedAt);
public sealed record Page<T>(IReadOnlyList<T> Items, string? NextCursor);
public static class EventTypes
{
    public const string IdentityChanged = "auth.identity.changed.v1";
    public const string ProfileChanged = "account.profile.changed.v1";
    public const string ChatChanged = "message.chat.changed.v1";
}
