using System.ComponentModel.DataAnnotations;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Message.Application;

public sealed record RoomRequest([property: Required, MaxLength(100)] string Name, Guid[] Members);
public sealed record DirectRequest(Guid UserId);
public sealed record SendRequest(Guid ClientMessageId, string? Text, Guid[] AttachmentIds);
public sealed record ReadRequest(long Sequence);
public sealed record MemberRequest(Guid UserId, string Role);
public sealed record TransferRequest(Guid UserId);
public sealed record MemberView(Guid UserId, string DisplayName, string Role, long LastReadSequence, bool Online);
public sealed record RoomView(Guid Id, string Name, string Kind, long LastSequence, long UnreadCount, IReadOnlyList<MemberView> Members);
public sealed record AttachmentView(Guid Id, string FileName, string ContentType, long Size);
public sealed record MessageView(Guid Id, Guid ClientMessageId, Guid SenderId, string SenderName, long Sequence,
    string Text, bool Deleted, DateTimeOffset CreatedAt, IReadOnlyList<AttachmentView> Attachments);
public sealed record FileDownload(Stream Stream, string FileName, string ContentType);

public interface IChatNotifier
{
    Task Changed(ChatChanged change, CancellationToken ct);
    Task Signal(Guid roomId, string kind, CancellationToken ct);
}
public interface IChatService
{
    Task<IReadOnlyList<RoomView>> Rooms(Actor actor, bool admin, CancellationToken ct);
    Task<RoomView> Create(Actor actor, RoomRequest request, CancellationToken ct);
    Task<RoomView> Direct(Actor actor, Guid userId, CancellationToken ct);
    Task<Page<MessageView>> History(Actor actor, Guid roomId, long? before, long? after, int limit, string? reason, CancellationToken ct);
    Task<MessageView> Send(Actor actor, Guid roomId, SendRequest request, CancellationToken ct);
    Task Read(Actor actor, Guid roomId, long sequence, CancellationToken ct);
    Task Members(Actor actor, Guid roomId, MemberRequest request, bool remove, string? reason, CancellationToken ct);
    Task Transfer(Actor actor, Guid roomId, Guid userId, CancellationToken ct);
    Task Moderate(Actor actor, Guid roomId, Guid messageId, string reason, CancellationToken ct);
    Task<AttachmentView> Upload(Actor actor, Guid roomId, string fileName, string contentType, Stream stream, CancellationToken ct);
    Task<FileDownload> Download(Actor actor, Guid id, string? reason, CancellationToken ct);
    Task<IReadOnlyList<AttachmentView>> Attachments(Actor actor, string reason, int limit, CancellationToken ct);
    Task EnsureMember(Actor actor, Guid roomId, CancellationToken ct);
}
