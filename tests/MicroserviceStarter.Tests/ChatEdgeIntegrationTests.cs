using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Application;
using MicroserviceStarter.Message.Domain;
using MicroserviceStarter.Message.Infrastructure;
using static MicroserviceStarter.Tests.IntegrationFixture;
using static MicroserviceStarter.Tests.AuthEdgeIntegrationTests;

namespace MicroserviceStarter.Tests;

[Collection("Integration")]
public class ChatEdgeIntegrationTests(IntegrationFixture fixture)
{
    private async Task WaitUser(TestLogin login) => await Wait(async () => await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Users.AnyAsync(x => x.Id == login.Login.User.Id)));
    [IntegrationFact]
    public async Task GroupMemberPermissionsCoverSelfLeaveOwnerProtectionUnknownTargetsAndCapacity()
    {
        var owner = await fixture.Register(); var member = await fixture.Register(); var extra = await fixture.Register(); var admin = await fixture.Login();
        await WaitUser(owner); await WaitUser(member); await WaitUser(extra);
        await using var scope = fixture.Message.Services.CreateAsyncScope(); var service = scope.ServiceProvider.GetRequiredService<IChatService>();
        var a = Actor(owner); var b = Actor(member); var c = Actor(extra); var root = Actor(admin);
        var room = await service.Create(a, new("權限邊界", [b.UserId]), default);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Create(a, new("太多成員", Enumerable.Range(0, 201).Select(_ => Guid.NewGuid()).ToArray()), default))).Error);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Rooms(a, true, default))).Error);
        Assert.Equal(Errors.RoomMissing, (await Assert.ThrowsAsync<AppException>(() => service.Send(c, room.Id, new(Guid.NewGuid(), "越權", []), default))).Error);
        Assert.Equal(Errors.NotFound, (await Assert.ThrowsAsync<AppException>(() => service.Members(a, room.Id, new(Guid.NewGuid(), "Member"), true, null, default))).Error);
        Assert.Equal(Errors.LastOwner, (await Assert.ThrowsAsync<AppException>(() => service.Members(a, room.Id, new(a.UserId, "Member"), false, null, default))).Error);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Transfer(a, room.Id, a.UserId, default))).Error);
        Assert.Equal(Errors.NotFound, (await Assert.ThrowsAsync<AppException>(() => service.Transfer(a, room.Id, Guid.NewGuid(), default))).Error);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Transfer(b, room.Id, a.UserId, default))).Error);
        await service.Members(b, room.Id, new(b.UserId, "Member"), true, null, default);
        await service.Members(root, room.Id, new(b.UserId, "Moderator"), false, "處理群組成員權限邊界", default);
        await service.Members(a, room.Id, new(c.UserId, "Moderator"), false, null, default);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Members(b, room.Id, new(c.UserId, "Member"), true, null, default))).Error);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Moderate(a, room.Id, Guid.NewGuid(), "一般會員不可管理訊息", default))).Error);
        Assert.Equal(Errors.NotFound, (await Assert.ThrowsAsync<AppException>(() => service.Moderate(root, room.Id, Guid.NewGuid(), "管理不存在的訊息目標", default))).Error);
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Attachments(a, "一般會員不可管理附件", 10, default))).Error);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.History(root, room.Id, null, null, 50, null, default))).Error);
        var db = scope.ServiceProvider.GetRequiredService<MessageDbContext>();
        for (var i = 0; i < 197; i++) db.Members.Add(new Membership { RoomId = room.Id, UserId = Guid.NewGuid() });
        await db.SaveChangesAsync();
        var candidate = await fixture.Register(); await WaitUser(candidate);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Members(a, room.Id, new(candidate.Login.User.Id, "Member"), false, null, default))).Error);
        var views = await service.Rooms(a, false, default); Assert.Contains(views.Single(x => x.Id == room.Id).Members, x => x.DisplayName == "同步中");
    }
    [IntegrationFact]
    public async Task AttachmentLifecycleRejectsPendingExpiredCrossRoomAndDuplicateReferences()
    {
        var user = await fixture.Register(); var other = await fixture.Register(); await WaitUser(user); await WaitUser(other);
        await using var scope = fixture.Message.Services.CreateAsyncScope(); var service = scope.ServiceProvider.GetRequiredService<IChatService>(); var db = scope.ServiceProvider.GetRequiredService<MessageDbContext>();
        var actor = Actor(user); var outsider = Actor(other);
        var room = await service.Create(actor, new("附件邊界", null!), default); var second = await service.Create(actor, new("其他房間", []), default);
        var pending = new Attachment { RoomId = room.Id, OwnerId = actor.UserId, FileName = "pending.txt", ObjectKey = "pending-" + Guid.NewGuid() };
        var expired = new Attachment { RoomId = room.Id, OwnerId = actor.UserId, Ready = true, FileName = "expired.txt", ObjectKey = "expired-" + Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow.AddHours(-25) };
        var wrongRoom = new Attachment { RoomId = second.Id, OwnerId = actor.UserId, Ready = true, FileName = "other.txt", ObjectKey = "other-" + Guid.NewGuid() };
        db.Attachments.AddRange(pending, expired, wrongRoom); await db.SaveChangesAsync();
        foreach (var id in new[] { pending.Id, expired.Id, wrongRoom.Id }) Assert.Equal(Errors.AttachmentUnavailable,
            (await Assert.ThrowsAsync<AppException>(() => service.Send(actor, room.Id, new(Guid.NewGuid(), "附件測試", [id]), default))).Error);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.Send(actor, room.Id, new(Guid.NewGuid(), "重複參照", [pending.Id, pending.Id]), default))).Error);
        Assert.Equal(Errors.AttachmentUnavailable, (await Assert.ThrowsAsync<AppException>(() => service.Download(actor, pending.Id, null, default))).Error);
        Assert.Equal(Errors.NotFound, (await Assert.ThrowsAsync<AppException>(() => service.Download(outsider, pending.Id, null, default))).Error);
        Assert.Equal(Errors.RoomMissing, (await Assert.ThrowsAsync<AppException>(() => service.Send(actor, Guid.NewGuid(), new(Guid.NewGuid(), "未知房間", []), default))).Error);
        var sent = await service.Send(actor, room.Id, new(Guid.NewGuid(), "可省略附件陣列", null!), default);
        Assert.Equal("可省略附件陣列", sent.Text);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.History(actor, room.Id, 0, null, 10, null, default))).Error);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.History(actor, room.Id, null, -1, 10, null, default))).Error);
        Assert.Equal(Errors.Validation, (await Assert.ThrowsAsync<AppException>(() => service.History(actor, room.Id, null, null, 101, null, default))).Error);
    }
    [IntegrationFact]
    public async Task ExactFileSizeAndFiveAttachmentLimitAreEnforcedAtTheHttpBoundary()
    {
        var user = await fixture.Register(); await WaitUser(user); using var client = fixture.Client(fixture.Message, user);
        var created = await client.PostAsJsonAsync("/api/v1/chat/rooms", new RoomRequest("上傳大小邊界", [])); var room = (await created.Content.ReadFromJsonAsync<RoomView>())!;
        async Task<HttpResponseMessage> Upload(int length)
        {
            using var body = new MultipartFormDataContent(); var content = new ByteArrayContent(Enumerable.Repeat((byte)'x', length).ToArray()); content.Headers.ContentType = new("text/plain"); body.Add(content, "file", "boundary.txt");
            return await client.PostAsync($"/api/v1/chat/rooms/{room.Id}/attachments", body);
        }
        Assert.Equal(HttpStatusCode.BadRequest, (await Upload(0)).StatusCode);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, (await Upload(ChatRules.MaxFileBytes + 1)).StatusCode);
        var exact = await Upload(ChatRules.MaxFileBytes); Assert.Equal(HttpStatusCode.OK, exact.StatusCode);
        var files = new List<Guid> { (await exact.Content.ReadFromJsonAsync<AttachmentView>())!.Id };
        for (var i = 0; i < 4; i++) files.Add((await (await Upload(1)).Content.ReadFromJsonAsync<AttachmentView>())!.Id);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync($"/api/v1/chat/rooms/{room.Id}/messages", new SendRequest(Guid.NewGuid(), "五個附件", files.ToArray()))).StatusCode);
    }
}
