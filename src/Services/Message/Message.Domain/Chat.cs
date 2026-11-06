using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Message.Domain;

public sealed class ChatUser
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = "";
    public bool Active { get; set; }
    public long ProfileVersion { get; set; }
    public long IdentityVersion { get; set; }
}
public sealed class Room
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Name { get; set; } = "";
    public string Kind { get; set; } = "group";
    public string? DirectKey { get; set; }
    public long LastSequence { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
public sealed class Membership
{
    public Guid RoomId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member";
    public long LastReadSequence { get; set; }
    public DateTimeOffset JoinedAt { get; set; } = DateTimeOffset.UtcNow;
}
public sealed class ChatMessage
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid RoomId { get; set; }
    public Guid SenderId { get; set; }
    public Guid ClientMessageId { get; set; }
    public long Sequence { get; set; }
    public string Text { get; set; } = "";
    public string RequestHash { get; set; } = "";
    public bool Deleted { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
public sealed class Attachment
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid RoomId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid? MessageId { get; set; }
    public bool Ready { get; set; }
    public string FileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long Size { get; set; }
    public string ObjectKey { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
public static class ChatRules
{
    public const int MaxFileBytes = 20 * 1024 * 1024;
    public static string Text(string? text, int attachmentCount)
    {
        if (attachmentCount is < 0 or > 5) throw new AppException(Errors.Validation, "每則訊息最多五個附件");
        var clean = Guard.Text(text, "text", 4000, 0);
        if (clean.Length == 0 && attachmentCount == 0) throw new AppException(Errors.Validation, "訊息或附件不可皆為空");
        return clean;
    }
    public static string DirectKey(Guid a, Guid b)
    {
        if (a == b || a == Guid.Empty || b == Guid.Empty) throw new AppException(Errors.Validation, "請選擇其他會員");
        return a.CompareTo(b) < 0 ? $"{a:N}:{b:N}" : $"{b:N}:{a:N}";
    }
    public static long ReadPosition(long current, long requested, long maximum)
    {
        if (requested < 0 || requested > maximum) throw new AppException(Errors.InvalidRead);
        return Math.Max(current, requested);
    }
    public static string FileName(string name)
    {
        if (name.IndexOfAny(['/', '\\', '\r', '\n', '\0']) >= 0 || name is "." or "..") throw new AppException(Errors.Validation, "檔名不正確");
        return Guard.Text(name, "fileName", 200);
    }
}
