using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Message.Domain;

namespace MicroserviceStarter.Message.Infrastructure;

public sealed class MessageDbContext(DbContextOptions<MessageDbContext> options) : PlatformDbContext(options)
{
    public DbSet<ChatUser> Users => Set<ChatUser>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Membership> Members => Set<Membership>();
    public DbSet<ChatMessage> Messages => Set<ChatMessage>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        model.Entity<Room>().HasIndex(x => x.DirectKey).IsUnique();
        model.Entity<Membership>().HasKey(x => new { x.RoomId, x.UserId });
        model.Entity<Membership>().HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Cascade);
        model.Entity<ChatMessage>().HasIndex(x => new { x.RoomId, x.Sequence }).IsUnique();
        model.Entity<ChatMessage>().HasIndex(x => new { x.RoomId, x.SenderId, x.ClientMessageId }).IsUnique();
        model.Entity<ChatMessage>().HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId);
        model.Entity<Attachment>().HasIndex(x => x.MessageId);
        model.Entity<Attachment>().HasIndex(x => new { x.CreatedAt, x.MessageId });
        model.Entity<Attachment>().HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId);
    }
}
