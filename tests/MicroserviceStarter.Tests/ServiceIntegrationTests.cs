using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.Account.Application;
using MicroserviceStarter.Account.Infrastructure;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Application;
using MicroserviceStarter.Message.Infrastructure;
using static MicroserviceStarter.Tests.IntegrationFixture;

namespace MicroserviceStarter.Tests;

[Collection("Integration")]
public class ServiceIntegrationTests(IntegrationFixture fixture)
{
    private async Task WaitUser(TestLogin login) => await Wait(async () => await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Users.AnyAsync(x => x.Id == login.Login.User.Id && x.Active)));
    private async Task<RoomView> Room(TestLogin user, params Guid[] members)
    {
        await WaitUser(user);
        foreach (var id in members) await Wait(async () => await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Users.AnyAsync(x => x.Id == id && x.Active)));
        using var client = fixture.Client(fixture.Message, user);
        var response = await client.PostAsJsonAsync("/api/v1/chat/rooms", new RoomRequest("測試群組", members));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<RoomView>())!;
    }
    [IntegrationFact]
    public async Task ProfilesSynchronizeVersionedPublicDataAndEnforceOwnership()
    {
        var user = await fixture.Register(); var other = await fixture.Register(); var admin = await fixture.Login();
        using var own = fixture.Client(fixture.Account, user); using var stranger = fixture.Client(fixture.Account, other); using var manager = fixture.Client(fixture.Account, admin);
        await Wait(async () => (await own.GetAsync("/api/v1/accounts/me")).StatusCode == HttpStatusCode.OK);
        var update = await own.PutAsJsonAsync("/api/v1/accounts/me", new ProfileRequest("同步測試😀", "個人介紹"));
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal("同步測試😀", (await (await own.GetAsync("/api/v1/accounts/me")).Content.ReadFromJsonAsync<ProfileView>())!.DisplayName);
        Assert.Equal(HttpStatusCode.OK, (await own.GetAsync("/api/v1/accounts/?search=同步測試&limit=1")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await own.GetAsync("/api/v1/accounts/?limit=101")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await stranger.PutAsJsonAsync("/api/v1/accounts/admin/" + user.Login.User.Id + "?reason=測試越權修改操作", new ProfileRequest("越權", ""))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await manager.PutAsJsonAsync("/api/v1/accounts/admin/" + user.Login.User.Id + "?reason=短", new ProfileRequest("管理修改", ""))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await manager.PutAsJsonAsync("/api/v1/accounts/admin/" + user.Login.User.Id + "?reason=測試管理員資料修正", new ProfileRequest("管理修改", ""))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await manager.PutAsJsonAsync("/api/v1/accounts/admin/" + Guid.NewGuid() + "?reason=測試不存在的帳號", new ProfileRequest("修改", ""))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await manager.GetAsync("/api/v1/accounts/admin/audit")).StatusCode);
        await Wait(async () => await Database<MessageDbContext, bool>(fixture.Message.Services, db => db.Users.AnyAsync(x => x.Id == user.Login.User.Id && x.DisplayName == "管理修改")));
    }
    [IntegrationFact]
    public async Task MessagesAreIdempotentOrderedAndReadPositionsCannotRegress()
    {
        var owner = await fixture.Register(); var member = await fixture.Register(); var room = await Room(owner, member.Login.User.Id);
        using var sender = fixture.Client(fixture.Message, owner); using var receiver = fixture.Client(fixture.Message, member);
        var url = $"/api/v1/chat/rooms/{room.Id}";
        var clientId = Guid.NewGuid(); var request = new SendRequest(clientId, "唯一訊息", []);
        var responses = await Task.WhenAll(Enumerable.Range(0, 4).Select(_ => sender.PostAsJsonAsync(url + "/messages", request)));
        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        var messages = await Task.WhenAll(responses.Select(async r => (await r.Content.ReadFromJsonAsync<MessageView>())!));
        Assert.Single(messages.Select(x => x.Id).Distinct());
        Assert.Equal(HttpStatusCode.Conflict, (await sender.PostAsJsonAsync(url + "/messages", request with { Text = "不同內容" })).StatusCode);
        var parallel = await Task.WhenAll(Enumerable.Range(0, 5).Select(i => sender.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "訊息 " + i, []))));
        Assert.All(parallel, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        var history = (await (await receiver.GetAsync(url + "/messages?after=0&limit=100")).Content.ReadFromJsonAsync<Page<MessageView>>())!;
        Assert.Equal(Enumerable.Range(1, 6).Select(x => (long)x), history.Items.Select(x => x.Sequence));
        var first = (await (await receiver.GetAsync(url + "/messages?limit=2")).Content.ReadFromJsonAsync<Page<MessageView>>())!;
        Assert.NotNull(first.NextCursor);
        Assert.Equal(HttpStatusCode.OK, (await receiver.GetAsync(url + "/messages?before=" + first.NextCursor)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await receiver.GetAsync(url + "/messages?after=0&before=2")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await receiver.PutAsJsonAsync(url + "/read", new ReadRequest(6))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await receiver.PutAsJsonAsync(url + "/read", new ReadRequest(1))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await receiver.PutAsJsonAsync(url + "/read", new ReadRequest(7))).StatusCode);
        var rooms = (await (await receiver.GetAsync("/api/v1/chat/rooms")).Content.ReadFromJsonAsync<RoomView[]>())!;
        Assert.Equal(0, rooms.Single(x => x.Id == room.Id).UnreadCount);
        Assert.Equal(6, rooms.Single(x => x.Id == room.Id).Members.Single(x => x.UserId == member.Login.User.Id).LastReadSequence);
    }
    [IntegrationFact]
    public async Task DirectRoomCreationIsCanonicalAndMembershipChangesPreserveAnOwner()
    {
        var owner = await fixture.Register(); var member = await fixture.Register(); var third = await fixture.Register();
        var room = await Room(owner, member.Login.User.Id); await WaitUser(third);
        using var client = fixture.Client(fixture.Message, owner); using var other = fixture.Client(fixture.Message, member); using var stranger = fixture.Client(fixture.Message, third);
        var url = $"/api/v1/chat/rooms/{room.Id}";
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.GetAsync(url + "/messages")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await other.PutAsJsonAsync(url + "/members", new MemberRequest(third.Login.User.Id, "Member"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsJsonAsync(url + "/members", new MemberRequest(third.Login.User.Id, "Member"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsJsonAsync(url + "/members", new MemberRequest(member.Login.User.Id, "Moderator"))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.DeleteAsync(url + "/members/" + owner.Login.User.Id)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync(url + "/members", new MemberRequest(third.Login.User.Id, "Root"))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await other.PutAsJsonAsync(url + "/members", new MemberRequest(third.Login.User.Id, "Moderator"))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsJsonAsync(url + "/owner", new TransferRequest(member.Login.User.Id))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await other.DeleteAsync(url + "/members/" + third.Login.User.Id)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await stranger.GetAsync(url + "/messages")).StatusCode);
        var direct = (await (await client.PostAsJsonAsync("/api/v1/chat/direct", new DirectRequest(member.Login.User.Id))).Content.ReadFromJsonAsync<RoomView>())!;
        var reverse = (await (await other.PostAsJsonAsync("/api/v1/chat/direct", new DirectRequest(owner.Login.User.Id))).Content.ReadFromJsonAsync<RoomView>())!;
        Assert.Equal(direct.Id, reverse.Id);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/v1/chat/rooms/{direct.Id}/members", new MemberRequest(third.Login.User.Id, "Member"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/chat/direct", new DirectRequest(owner.Login.User.Id))).StatusCode);
    }
    [IntegrationFact]
    public async Task AttachmentsUseRealS3AndRequireOwnerRoomAndCurrentSessionPermissions()
    {
        var owner = await fixture.Register(); var member = await fixture.Register(); var stranger = await fixture.Register(); var admin = await fixture.Login();
        var room = await Room(owner, member.Login.User.Id);
        using var client = fixture.Client(fixture.Message, owner); using var other = fixture.Client(fixture.Message, member); using var denied = fixture.Client(fixture.Message, stranger); using var manager = fixture.Client(fixture.Message, admin);
        var url = $"/api/v1/chat/rooms/{room.Id}";
        using var multipart = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("附件內容😀\n"); var file = new ByteArrayContent(bytes); file.Headers.ContentType = new("text/plain"); multipart.Add(file, "file", "附件.txt");
        var result = await client.PostAsync(url + "/attachments", multipart);
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        var attachment = (await result.Content.ReadFromJsonAsync<AttachmentView>())!;
        Assert.Equal(HttpStatusCode.NotFound, (await other.GetAsync("/api/v1/chat/attachments/" + attachment.Id)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await other.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "越權附件", [attachment.Id]))).StatusCode);
        var sent = await client.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "", [attachment.Id]));
        Assert.Equal(HttpStatusCode.OK, sent.StatusCode);
        Assert.Equal(bytes, await other.GetByteArrayAsync("/api/v1/chat/attachments/" + attachment.Id));
        Assert.Equal(HttpStatusCode.NotFound, (await denied.GetAsync("/api/v1/chat/attachments/" + attachment.Id)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "重用附件", [attachment.Id]))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await manager.GetAsync("/api/v1/chat/admin/attachments?reason=測試附件管理查閱")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await manager.GetAsync("/api/v1/chat/attachments/" + attachment.Id + "?reason=測試管理員附件下載")).StatusCode);
        var message = (await sent.Content.ReadFromJsonAsync<MessageView>())!;
        Assert.Equal(HttpStatusCode.NoContent, (await manager.DeleteAsync($"/api/v1/chat/admin/rooms/{room.Id}/messages/{message.Id}?reason=測試訊息內容管理移除")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await other.GetAsync("/api/v1/chat/attachments/" + attachment.Id)).StatusCode);
        var history = (await (await manager.GetAsync(url + "/messages?reason=測試管理員內容查閱")).Content.ReadFromJsonAsync<Page<MessageView>>())!;
        Assert.True(history.Items.Single(x => x.Id == message.Id).Deleted); Assert.Empty(history.Items.Single(x => x.Id == message.Id).Attachments);
        Assert.Equal(HttpStatusCode.OK, (await manager.GetAsync("/api/v1/chat/admin/rooms?reason=測試聊天室管理查閱")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await manager.GetAsync("/api/v1/chat/admin/audit")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/chat/admin/rooms?reason=測試越權管理查閱")).StatusCode);
    }
    [IntegrationFact]
    public async Task InvalidChatRequestsReturnTheExpectedHttpStatusAndErrorCatalogCode()
    {
        var owner = await fixture.Register(); var room = await Room(owner);
        using var client = fixture.Client(fixture.Message, owner); var url = $"/api/v1/chat/rooms/{room.Id}";
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.Empty, "hello", []))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "", []))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "text", Enumerable.Range(0, 6).Select(_ => Guid.NewGuid()).ToArray()))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync(url + "/messages", new SendRequest(Guid.NewGuid(), "text", [Guid.NewGuid()]))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/chat/rooms/{Guid.NewGuid()}/messages")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(url + "/messages?limit=0")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(url + "/messages?after=-1")).StatusCode);
        using var invalid = new MultipartFormDataContent(); var payload = new ByteArrayContent("fake"u8.ToArray()); payload.Headers.ContentType = new("image/png"); invalid.Add(payload, "file", "fake.png");
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, (await client.PostAsync(url + "/attachments", invalid)).StatusCode);
        Assert.Equal(HttpStatusCode.MethodNotAllowed, (await client.SendAsync(new HttpRequestMessage(HttpMethod.Patch, "/api/v1/chat/rooms"))).StatusCode);
        using var anonymous = fixture.Message.CreateClient(); Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/v1/chat/rooms")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await anonymous.PostAsJsonAsync("/internal/sessions/revoke", Array.Empty<Guid>())).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/health/live")).StatusCode); Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/health/ready")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/openapi/v1.json")).StatusCode);
    }
}
