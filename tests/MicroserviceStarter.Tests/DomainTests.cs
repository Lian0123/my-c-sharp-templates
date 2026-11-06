using System.Text;
using MicroserviceStarter.Account.Domain;
using MicroserviceStarter.Auth.Domain;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Domain;
using MicroserviceStarter.Message.Infrastructure;

namespace MicroserviceStarter.Tests;

public class DomainTests
{
    [Fact]
    public void ErrorCatalogHasUniqueSevenDigitCodesMatchingHttpStatusAndServiceRanges()
    {
        Assert.Equal(Errors.All.Count, Errors.All.Select(x => x.Code).Distinct().Count());
        foreach (var error in Errors.All)
        {
            Assert.Matches("^[45][0-9]{6}$", error.Code);
            Assert.Equal(error.Status.ToString(), error.Code[..3]);
            Assert.InRange(int.Parse(error.Code[3..]), 1, 4999);
            Assert.False(string.IsNullOrWhiteSpace(error.Title));
        }
        Assert.Equal(Errors.Validation, Errors.ForStatus(400));
        Assert.Equal("4180001", Errors.ForStatus(418).Code);
    }
    [Theory]
    [InlineData(null, 1)]
    [InlineData("", 1)]
    [InlineData("  ", 1)]
    [InlineData("abcd", 3)]
    [InlineData("a\0b", 10)]
    public void TextRejectsMissingOverlongAndNullCharacters(string? text, int max) =>
        Assert.Equal(Errors.Validation, Assert.Throws<AppException>(() => Guard.Text(text, "field", max)).Error);
    [Fact]
    public void TextCountsUnicodeCodepointsAndTrims()
    { Assert.Equal("😀台", Guard.Text(" 😀台 ", "field", 2)); Assert.Equal("", Guard.Text(null, "bio", 500, 0)); Assert.Throws<AppException>(() => Guard.Reason("四個字")); Assert.Equal("完整管理原因", Guard.Reason("完整管理原因")); }
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(101)]
    public void InvalidPageSizesFail(int value) => Assert.Throws<AppException>(() => Guard.PageSize(value));
    [Theory]
    [InlineData(1)]
    [InlineData(100)]
    public void ValidPageSizesSucceed(int value) => Assert.Equal(value, Guard.PageSize(value));
    [Theory]
    [InlineData("x")]
    [InlineData("user@@host")]
    [InlineData("Display <user@example.com>")]
    public void EmailRejectsInvalidAddresses(string email) => Assert.Throws<AppException>(() => IdentityRules.NormalizeEmail(email));
    [Fact] public void EmailIsNormalizedCaseInsensitively() => Assert.Equal("USER@EXAMPLE.COM", IdentityRules.NormalizeEmail(" user@example.com "));
    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    [InlineData(129)]
    public void PasswordLengthBoundariesFail(int size) => Assert.Throws<AppException>(() => IdentityRules.Password(new string('x', size)));
    [Theory]
    [InlineData(12)]
    [InlineData(128)]
    public void PasswordLengthBoundariesSucceed(int size) => Assert.Equal(size, IdentityRules.Password(new string('x', size)).Length);
    [Fact] public void PasswordRejectsWhitespaceAndNullBytes() { Assert.Throws<AppException>(() => IdentityRules.Password(new string(' ', 12))); Assert.Throws<AppException>(() => IdentityRules.Password("abcdefghijkl\0")); }
    [Fact] public void SecretsAreRandomAndOnlyHashesAreCompared() { var a = IdentityRules.Secret(); Assert.Equal(64, a.Length); Assert.NotEqual(a, IdentityRules.Secret()); Assert.Equal(IdentityRules.Hash(a), IdentityRules.Hash(a)); Assert.NotEqual(a, IdentityRules.Hash(a)); }
    [Theory]
    [InlineData("Admin")]
    [InlineData("User")]
    public void ValidRolesSucceed(string role) => Assert.Equal(role, IdentityRules.Role(role));
    [Fact] public void UnknownRoleFails() => Assert.Throws<AppException>(() => IdentityRules.Role("Root"));
    [Fact] public void LastAdminIsPreserved() { Assert.Equal(Errors.LastAdmin, Assert.Throws<AppException>(() => IdentityRules.RequireAnotherAdmin(true, false, 1)).Error); IdentityRules.RequireAnotherAdmin(true, false, 2); IdentityRules.RequireAnotherAdmin(true, true, 1); IdentityRules.RequireAnotherAdmin(false, false, 0); }
    [Fact] public void ProfileChangesIncrementVersion() { var p = new Profile(); p.Update(" 新名稱 ", "介紹"); Assert.Equal("新名稱", p.DisplayName); Assert.Equal("介紹", p.Bio); Assert.Equal(2, p.Version); }
    [Fact] public void DirectRoomsUseCanonicalPairAndCannotTargetSelf() { var a = Guid.NewGuid(); var b = Guid.NewGuid(); Assert.Equal(ChatRules.DirectKey(a, b), ChatRules.DirectKey(b, a)); Assert.Throws<AppException>(() => ChatRules.DirectKey(a, a)); Assert.Throws<AppException>(() => ChatRules.DirectKey(Guid.Empty, b)); Assert.Throws<AppException>(() => ChatRules.DirectKey(a, Guid.Empty)); }
    [Theory]
    [InlineData(-1)]
    [InlineData(6)]
    public void AttachmentCountBoundariesFail(int count) => Assert.Throws<AppException>(() => ChatRules.Text("ok", count));
    [Fact] public void MessageRequiresTextOrAttachments() { Assert.Throws<AppException>(() => ChatRules.Text(" ", 0)); Assert.Equal("", ChatRules.Text(null, 1)); Assert.Equal("文字", ChatRules.Text("文字", 5)); Assert.Equal(4000, ChatRules.Text(new string('x', 4000), 0).Length); Assert.Throws<AppException>(() => ChatRules.Text(new string('x', 4001), 0)); }
    [Theory]
    [InlineData(-1)]
    [InlineData(11)]
    public void ReadBeyondHistoryFails(long requested) => Assert.Throws<AppException>(() => ChatRules.ReadPosition(2, requested, 10));
    [Fact] public void ReadNeverMovesBackwards() { Assert.Equal(8, ChatRules.ReadPosition(8, 2, 10)); Assert.Equal(10, ChatRules.ReadPosition(8, 10, 10)); Assert.Equal(0, ChatRules.ReadPosition(0, 0, 0)); }
    [Theory]
    [InlineData("../x.txt")]
    [InlineData("a\\x.txt")]
    [InlineData("a\r.txt")]
    [InlineData("a\n.txt")]
    [InlineData("a\0.txt")]
    [InlineData(".")]
    [InlineData("..")]
    public void FileNamesRejectPathsAndHeaderInjection(string name) => Assert.Throws<AppException>(() => ChatRules.FileName(name));
    [Fact] public void FileNamesPreserveUnicode() => Assert.Equal("附件😀.txt", ChatRules.FileName("附件😀.txt"));
    [Fact]
    public void AttachmentPolicyChecksUtf8MimeAndExactSizeBoundaries()
    {
        Assert.Equal("text/plain", AttachmentPolicy.Validate("a.txt", "text/plain; charset=utf-8", "你好"u8));
        Assert.Equal("text/plain", AttachmentPolicy.Validate("a.txt", "text/plain", new byte[ChatRules.MaxFileBytes].Select(_ => (byte)'a').ToArray()));
        Assert.Equal(Errors.TooLarge, Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.txt", "text/plain", new byte[ChatRules.MaxFileBytes + 1])).Error);
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.txt", "text/plain", []));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.txt", "text/plain", [0]));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.txt", "text/plain", [255]));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.txt", "image/png", "abc"u8));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.exe", "application/octet-stream", "abc"u8));
    }
    [Fact]
    public void InvalidPdfAndSpoofedImagesAreRejected()
    {
        Assert.Equal("application/pdf", AttachmentPolicy.Validate("a.pdf", "application/pdf", "%PDF-1.7\n%%EOF"u8));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.pdf", "application/pdf", "%PDF-1.7"u8));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.pdf", "application/pdf", "broken\n%%EOF"u8));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.png", "image/png", "not-an-image"u8));
    }
    [Fact] public void ActorAdminPermissionIsExplicit() { Assert.True(new Actor(Guid.NewGuid(), Guid.NewGuid(), 1, "Admin").IsAdmin); Assert.False(new Actor(Guid.NewGuid(), Guid.NewGuid(), 1, "User").IsAdmin); }
}
