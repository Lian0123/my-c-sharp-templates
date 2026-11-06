using MicroserviceStarter.Contracts;

namespace MicroserviceStarter.Account.Domain;

public sealed class Profile
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = "";
    public string Bio { get; set; } = "";
    public bool Active { get; set; } = true;
    public long IdentityVersion { get; set; }
    public long Version { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public void Update(string displayName, string bio)
    { DisplayName = Guard.Text(displayName, "displayName", 50); Bio = Guard.Text(bio, "bio", 500, 0); Version++; }
}
