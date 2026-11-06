using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Application;
using MicroserviceStarter.Message.Domain;

namespace MicroserviceStarter.Message.Infrastructure;

public sealed class MessageIntegrationHandler(MessageDbContext db, IChatNotifier notifier) : IIntegrationHandler
{
    public IReadOnlyList<string> Bindings => [EventTypes.IdentityChanged, EventTypes.ProfileChanged, EventTypes.ChatChanged];
    public async Task Handle(IntegrationEvent envelope, CancellationToken ct)
    {
        if (envelope.Type == EventTypes.ChatChanged)
        { await notifier.Changed(Json.Read<ChatChanged>(envelope.Payload), ct); return; }
        var user = await db.Users.SingleOrDefaultAsync(x => x.Id == envelope.AggregateId, ct);
        if (user is null) { user = new ChatUser { Id = envelope.AggregateId }; db.Users.Add(user); }
        switch (envelope.Type)
        {
            case EventTypes.IdentityChanged:
                var identity = Json.Read<IdentityChanged>(envelope.Payload);
                if (user.IdentityVersion >= identity.Version) return;
                user.IdentityVersion = identity.Version; user.Active = identity.Active;
                if (user.ProfileVersion == 0) user.DisplayName = identity.DisplayName;
                break;
            case EventTypes.ProfileChanged:
                var profile = Json.Read<ProfileChanged>(envelope.Payload);
                if (user.ProfileVersion >= profile.Version) return;
                user.ProfileVersion = profile.Version; user.DisplayName = profile.DisplayName;
                if (user.IdentityVersion == 0) user.Active = profile.Active;
                break;
            default: throw new InvalidDataException("Unsupported event");
        }
    }
}
