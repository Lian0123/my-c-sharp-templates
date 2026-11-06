using System.ComponentModel.DataAnnotations;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Auth.Application;

public sealed record RegisterRequest([property: Required, EmailAddress, MaxLength(254)] string Email,
    [property: Required, MinLength(12), MaxLength(128)] string Password, [property: Required, MaxLength(50)] string DisplayName);
public sealed record LoginRequest([property: Required, EmailAddress] string Email, [property: Required, MaxLength(128)] string Password);
public sealed record EmailRequest([property: Required, EmailAddress, MaxLength(254)] string Email);
public sealed record TokenRequest([property: Required, MaxLength(128)] string Token);
public sealed record ResetRequest([property: Required, MaxLength(128)] string Token, [property: Required, MinLength(12), MaxLength(128)] string Password);
public sealed record ManageUserRequest(string Role, bool Active, string Reason);
public sealed record UserView(Guid Id, string Email, string DisplayName, string Role, bool Active, bool EmailVerified, DateTimeOffset CreatedAt);
public sealed record LoginResult(string AccessToken, int ExpiresIn, string CsrfToken, UserView User);
public sealed record SessionResult(LoginResult Login, string RefreshToken, DateTimeOffset ExpiresAt);

public interface IAuthService
{
    Task<Guid> Register(RegisterRequest request, CancellationToken ct);
    Task<SessionResult> Login(LoginRequest request, string address, CancellationToken ct);
    Task<SessionResult> Refresh(string token, string csrf, CancellationToken ct);
    Task Logout(Actor actor, string csrf, CancellationToken ct);
    Task SendChallenge(EmailRequest request, string purpose, CancellationToken ct);
    Task Verify(string token, CancellationToken ct);
    Task Reset(ResetRequest request, CancellationToken ct);
    Task<IReadOnlyList<UserView>> Users(Actor actor, int limit, CancellationToken ct);
    Task Manage(Actor actor, Guid id, ManageUserRequest request, CancellationToken ct);
}
