using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Application;
using MicroserviceStarter.Message.Domain;
using StackExchange.Redis;

namespace MicroserviceStarter.Message.Infrastructure;

public sealed class ChatService(MessageDbContext db, IObjectStorage storage, IChatNotifier notifier, IConnectionMultiplexer redis) : IChatService
{
    public async Task<IReadOnlyList<RoomView>> Rooms(Actor actor, bool admin, CancellationToken ct)
    {
        if (admin && !actor.IsAdmin) throw new AppException(Errors.Forbidden);
        var query = db.Rooms.AsNoTracking();
        if (!admin) query = query.Where(r => db.Members.Any(m => m.RoomId == r.Id && m.UserId == actor.UserId));
        var rooms = await query.OrderByDescending(x => x.CreatedAt).Take(100).ToListAsync(ct);
        var result = new List<RoomView>();
        foreach (var room in rooms) result.Add(await View(room, actor, ct));
        return result;
    }

    public async Task<RoomView> Create(Actor actor, RoomRequest request, CancellationToken ct)
    {
        request.Validate();
        var members = (request.Members ?? []).Append(actor.UserId).Distinct().ToArray();
        if (members.Length > 200) throw new AppException(Errors.Validation, "每個群組最多 200 位成員");
        await KnownUsers(members, ct);
        var room = new Room { Name = Guard.Text(request.Name, "name", 100) };
        db.Rooms.Add(room);
        foreach (var id in members) db.Members.Add(new() { RoomId = room.Id, UserId = id, Role = id == actor.UserId ? "Owner" : "Member" });
        await db.SaveChangesAsync(ct);
        return await View(room, actor, ct);
    }

    public async Task<RoomView> Direct(Actor actor, Guid userId, CancellationToken ct)
    {
        var key = ChatRules.DirectKey(actor.UserId, userId);
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtext({key}))", ct);
        var room = await db.Rooms.SingleOrDefaultAsync(x => x.DirectKey == key, ct);
        if (room is null)
        {
            await KnownUsers([actor.UserId, userId], ct);
            room = new Room { Name = "私人對話", Kind = "direct", DirectKey = key };
            db.Rooms.Add(room);
            db.Members.AddRange(new Membership { RoomId = room.Id, UserId = actor.UserId }, new Membership { RoomId = room.Id, UserId = userId });
            await db.SaveChangesAsync(ct);
        }
        await transaction.CommitAsync(ct);
        return await View(room, actor, ct);
    }

    public async Task<Page<MessageView>> History(Actor actor, Guid roomId, long? before, long? after, int limit, string? reason, CancellationToken ct)
    {
        Guard.PageSize(limit);
        if (before < 1 || after < 0 || before is not null && after is not null) throw new AppException(Errors.Validation, "分頁游標不正確");
        await Access(actor, roomId, reason, "messages.read", ct);
        var query = db.Messages.AsNoTracking().Where(x => x.RoomId == roomId);
        if (before is not null) query = query.Where(x => x.Sequence < before);
        if (after is not null) query = query.Where(x => x.Sequence > after);
        var messages = after is not null ? await query.OrderBy(x => x.Sequence).Take(limit + 1).ToListAsync(ct)
            : await query.OrderByDescending(x => x.Sequence).Take(limit + 1).ToListAsync(ct);
        var more = messages.Count > limit;
        messages = messages.Take(limit).ToList();
        var next = more ? messages.Last().Sequence.ToString() : null;
        var views = new List<MessageView>();
        foreach (var message in messages.OrderBy(x => x.Sequence)) views.Add(await MessageView(message, ct));
        return new(views, next);
    }

    public async Task<MessageView> Send(Actor actor, Guid roomId, SendRequest request, CancellationToken ct)
    {
        var ids = request.AttachmentIds ?? [];
        var text = ChatRules.Text(request.Text, ids.Length);
        if (request.ClientMessageId == Guid.Empty || ids.Distinct().Count() != ids.Length) throw new AppException(Errors.Validation);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(Json.Write(new { text, ids = ids.Order().ToArray() }))));
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var room = await LockedRoom(roomId, ct);
        await EnsureMember(actor, roomId, ct);
        var existing = await db.Messages.SingleOrDefaultAsync(x => x.RoomId == roomId && x.SenderId == actor.UserId && x.ClientMessageId == request.ClientMessageId, ct);
        if (existing is not null)
        {
            if (existing.RequestHash != hash) throw new AppException(Errors.Conflict, "同一個 clientMessageId 不可使用不同內容");
            await transaction.CommitAsync(ct); return await MessageView(existing, ct);
        }
        var files = await db.Attachments.Where(x => ids.Contains(x.Id)).ToListAsync(ct);
        if (files.Count != ids.Length || files.Any(x => !x.Ready || x.RoomId != roomId || x.OwnerId != actor.UserId || x.MessageId is not null || x.CreatedAt < DateTimeOffset.UtcNow.AddHours(-24)))
            throw new AppException(Errors.AttachmentUnavailable);
        room.LastSequence++;
        var message = new ChatMessage
        {
            RoomId = roomId,
            SenderId = actor.UserId,
            ClientMessageId = request.ClientMessageId,
            Sequence = room.LastSequence,
            Text = text,
            RequestHash = hash
        };
        db.Messages.Add(message);
        foreach (var file in files) file.MessageId = message.Id;
        db.Enqueue(EventTypes.ChatChanged, roomId, message.Sequence, new ChatChanged(roomId, message.Id, message.Sequence));
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        return await MessageView(message, ct);
    }

    public async Task Read(Actor actor, Guid roomId, long sequence, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var room = await LockedRoom(roomId, ct);
        var member = await Member(actor, roomId, ct);
        member.LastReadSequence = ChatRules.ReadPosition(member.LastReadSequence, sequence, room.LastSequence);
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        await notifier.Signal(roomId, "read", ct);
    }

    public async Task Members(Actor actor, Guid roomId, MemberRequest request, bool remove, string? reason, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var room = await LockedRoom(roomId, ct);
        if (room.Kind != "group") throw new AppException(Errors.Validation, "私人對話不能修改成員");
        var own = await db.Members.SingleOrDefaultAsync(x => x.RoomId == roomId && x.UserId == actor.UserId, ct);
        if (!actor.IsAdmin && own?.Role is not ("Owner" or "Moderator") && !(remove && request.UserId == actor.UserId)) throw new AppException(Errors.Forbidden);
        if (actor.IsAdmin) db.Record(actor, remove ? "member.remove" : "member.change", roomId + ":" + request.UserId, reason ?? "");
        var target = await db.Members.SingleOrDefaultAsync(x => x.RoomId == roomId && x.UserId == request.UserId, ct);
        if (target?.Role == "Owner") throw new AppException(Errors.LastOwner);
        if (own?.Role == "Moderator" && (target?.Role == "Moderator" || request.Role != "Member") && !actor.IsAdmin) throw new AppException(Errors.Forbidden);
        if (remove)
        { if (target is null) throw new AppException(Errors.NotFound); db.Members.Remove(target); }
        else
        {
            if (request.Role is not ("Member" or "Moderator")) throw new AppException(Errors.Validation);
            await KnownUsers([request.UserId], ct);
            if (target is null)
            {
                if (await db.Members.CountAsync(x => x.RoomId == roomId, ct) >= 200) throw new AppException(Errors.Validation);
                db.Members.Add(new() { RoomId = roomId, UserId = request.UserId, Role = request.Role });
            }
            else target.Role = request.Role;
        }
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        await notifier.Signal(roomId, "members", ct);
    }

    public async Task Transfer(Actor actor, Guid roomId, Guid userId, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var room = await LockedRoom(roomId, ct);
        var current = await Member(actor, roomId, ct);
        if (room.Kind != "group" || current.Role != "Owner") throw new AppException(Errors.Forbidden);
        var next = await db.Members.SingleOrDefaultAsync(x => x.RoomId == roomId && x.UserId == userId, ct) ?? throw new AppException(Errors.NotFound);
        if (current.UserId == next.UserId) throw new AppException(Errors.Validation);
        current.Role = "Moderator"; next.Role = "Owner";
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        await notifier.Signal(roomId, "members", ct);
    }

    public async Task Moderate(Actor actor, Guid roomId, Guid messageId, string reason, CancellationToken ct)
    {
        if (!actor.IsAdmin) throw new AppException(Errors.Forbidden);
        Guard.Reason(reason);
        var message = await db.Messages.SingleOrDefaultAsync(x => x.Id == messageId && x.RoomId == roomId, ct) ?? throw new AppException(Errors.NotFound);
        message.Deleted = true;
        db.Record(actor, "message.moderate", messageId.ToString(), reason);
        db.Enqueue(EventTypes.ChatChanged, roomId, message.Sequence, new ChatChanged(roomId, message.Id, message.Sequence));
        await db.SaveChangesAsync(ct);
    }

    public async Task<AttachmentView> Upload(Actor actor, Guid roomId, string fileName, string contentType, Stream stream, CancellationToken ct)
    {
        await EnsureMember(actor, roomId, ct);
        ChatRules.FileName(fileName);
        using var buffer = new MemoryStream();
        var chunk = new byte[65536]; int read;
        while ((read = await stream.ReadAsync(chunk, ct)) > 0)
        { if (buffer.Length + read > ChatRules.MaxFileBytes) throw new AppException(Errors.TooLarge); await buffer.WriteAsync(chunk.AsMemory(0, read), ct); }
        var type = AttachmentPolicy.Validate(fileName, contentType, buffer.GetBuffer().AsSpan(0, (int)buffer.Length));
        var attachment = new Attachment { RoomId = roomId, OwnerId = actor.UserId, FileName = fileName, Size = buffer.Length, ContentType = type };
        attachment.ObjectKey = "uploads/" + attachment.Id.ToString("N");
        // Persist the pending reference first: cleanup can recover even if the process dies after S3 accepts a file.
        db.Attachments.Add(attachment); await db.SaveChangesAsync(ct);
        buffer.Position = 0;
        await storage.Put(attachment.ObjectKey, buffer, type, ct);
        attachment.Ready = true;
        await db.SaveChangesAsync(ct);
        return new(attachment.Id, attachment.FileName, type, attachment.Size);
    }

    public async Task<FileDownload> Download(Actor actor, Guid id, string? reason, CancellationToken ct)
    {
        var file = await db.Attachments.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new AppException(Errors.NotFound);
        if (file.MessageId is null && file.OwnerId != actor.UserId && !actor.IsAdmin) throw new AppException(Errors.NotFound);
        if (!file.Ready) throw new AppException(Errors.AttachmentUnavailable);
        if (file.MessageId is not null && await db.Messages.AnyAsync(x => x.Id == file.MessageId && x.Deleted, ct) && !actor.IsAdmin) throw new AppException(Errors.NotFound);
        await Access(actor, file.RoomId, reason, "attachment.download", ct);
        return new(await storage.Get(file.ObjectKey, ct), file.FileName, file.ContentType);
    }

    public async Task<IReadOnlyList<AttachmentView>> Attachments(Actor actor, string reason, int limit, CancellationToken ct)
    {
        if (!actor.IsAdmin) throw new AppException(Errors.Forbidden);
        db.Record(actor, "attachments.list", "all", reason); await db.SaveChangesAsync(ct);
        return await db.Attachments.AsNoTracking().OrderByDescending(x => x.CreatedAt).Take(Guard.PageSize(limit))
            .Select(x => new AttachmentView(x.Id, x.FileName, x.ContentType, x.Size)).ToListAsync(ct);
    }

    public async Task EnsureMember(Actor actor, Guid roomId, CancellationToken ct) => _ = await Member(actor, roomId, ct);
    private async Task<Membership> Member(Actor actor, Guid roomId, CancellationToken ct) =>
        await db.Members.SingleOrDefaultAsync(x => x.RoomId == roomId && x.UserId == actor.UserId, ct) ?? throw new AppException(Errors.RoomMissing);
    private async Task<Room> LockedRoom(Guid id, CancellationToken ct) =>
        await db.Rooms.FromSqlInterpolated($"SELECT * FROM \"Rooms\" WHERE \"Id\" = {id} FOR UPDATE").SingleOrDefaultAsync(ct) ?? throw new AppException(Errors.RoomMissing);
    private async Task KnownUsers(Guid[] ids, CancellationToken ct)
    { if (await db.Users.CountAsync(x => ids.Contains(x.Id) && x.Active, ct) != ids.Length) throw new AppException(Errors.Unavailable, "會員資料同步中，請稍後重試"); }
    private async Task Access(Actor actor, Guid roomId, string? reason, string action, CancellationToken ct)
    {
        var member = await db.Members.AnyAsync(x => x.RoomId == roomId && x.UserId == actor.UserId, ct);
        if (!member && !actor.IsAdmin) throw new AppException(Errors.RoomMissing);
        if (!member || actor.IsAdmin && reason is not null)
        { db.Record(actor, action, roomId.ToString(), reason ?? ""); await db.SaveChangesAsync(ct); }
    }
    private async Task<RoomView> View(Room room, Actor actor, CancellationToken ct)
    {
        var members = await db.Members.AsNoTracking().Where(x => x.RoomId == room.Id).ToListAsync(ct);
        var ids = members.Select(x => x.UserId).ToArray();
        var users = await db.Users.AsNoTracking().Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct);
        var views = new List<MemberView>();
        foreach (var member in members)
        {
            var online = false;
            try { online = await redis.GetDatabase().SortedSetLengthAsync("chat:presence:" + member.UserId, DateTimeOffset.UtcNow.ToUnixTimeSeconds(), double.PositiveInfinity) > 0; }
            catch (RedisException) { }
            views.Add(new(member.UserId, users.GetValueOrDefault(member.UserId)?.DisplayName ?? "同步中", member.Role, member.LastReadSequence, online));
        }
        var last = members.FirstOrDefault(x => x.UserId == actor.UserId)?.LastReadSequence ?? room.LastSequence;
        var unread = await db.Messages.CountAsync(x => x.RoomId == room.Id && x.Sequence > last && x.SenderId != actor.UserId && !x.Deleted, ct);
        return new(room.Id, room.Name, room.Kind, room.LastSequence, unread, views);
    }
    private async Task<MessageView> MessageView(ChatMessage message, CancellationToken ct)
    {
        var files = message.Deleted ? [] : await db.Attachments.AsNoTracking().Where(x => x.MessageId == message.Id)
            .Select(x => new AttachmentView(x.Id, x.FileName, x.ContentType, x.Size)).ToListAsync(ct);
        var name = await db.Users.Where(x => x.Id == message.SenderId).Select(x => x.DisplayName).FirstOrDefaultAsync(ct) ?? "會員";
        return new(message.Id, message.ClientMessageId, message.SenderId, name, message.Sequence, message.Deleted ? "此訊息已由管理員移除" : message.Text, message.Deleted, message.CreatedAt, files);
    }
}
