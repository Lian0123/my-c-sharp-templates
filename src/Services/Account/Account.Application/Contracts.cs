using System.ComponentModel.DataAnnotations;
using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Account.Application;

public sealed record ProfileRequest([property: Required, MaxLength(50)] string DisplayName, [property: MaxLength(500)] string Bio);
public sealed record ProfileView(Guid Id, string DisplayName, string Bio, bool Active, long Version);
public interface IAccountService
{
    Task<ProfileView?> Me(Actor actor, CancellationToken ct);
    Task<ProfileView> Update(Actor actor, Guid id, ProfileRequest request, string? reason, CancellationToken ct);
    Task<IReadOnlyList<ProfileView>> Search(string? search, int limit, CancellationToken ct);
}
