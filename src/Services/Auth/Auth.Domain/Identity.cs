using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Auth.Domain;

public sealed class User
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Email { get; set; } = "";
    public string NormalizedEmail { get; set; } = "";
    public string InitialDisplayName { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool EmailVerified { get; set; }
    public bool Active { get; set; } = true;
    public string Role { get; set; } = "User";
    public long SecurityVersion { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class LoginSession
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }
    public Guid FamilyId { get; set; } = Guid.CreateVersion7();
    public string RefreshHash { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string CsrfHash { get; set; } = "";
}

public sealed class EmailChallenge
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }
    public string Purpose { get; set; } = "verify";
    public string TokenHash { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
}

public sealed class MailJob
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Recipient { get; set; } = "";
    public string Subject { get; set; } = "";
    public string ProtectedBody { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DeliveredAt { get; set; }
}

public static class IdentityRules
{
    public static string NormalizeEmail(string email)
    {
        email = Guard.Text(email, "email", 254);
        if (!MailAddress.TryCreate(email, out var parsed) || parsed.Address != email) throw new AppException(Errors.Validation, "Email 格式不正確");
        return email.ToUpperInvariant();
    }

    public static string Password(string password)
    {
        if (password.Length is < 12 or > 128 || password.Contains('\0') || string.IsNullOrWhiteSpace(password))
            throw new AppException(Errors.Validation, "密碼長度必須介於 12 至 128 個字元");
        return password;
    }

    public static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    public static string Secret() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    public static string Role(string role) => role is "Admin" or "User" ? role : throw new AppException(Errors.Validation, "角色必須是 Admin 或 User");
    public static void RequireAnotherAdmin(bool currentlyActiveAdmin, bool remainsActiveAdmin, int activeAdmins)
    {
        if (currentlyActiveAdmin && !remainsActiveAdmin && activeAdmins <= 1) throw new AppException(Errors.LastAdmin);
    }
}
