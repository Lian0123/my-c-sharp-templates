using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.Auth.Domain;
using MicroserviceStarter.BuildingBlocks;

namespace MicroserviceStarter.Auth.Infrastructure;

public sealed class AuthDbContext(DbContextOptions<AuthDbContext> options) : PlatformDbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<LoginSession> Sessions => Set<LoginSession>();
    public DbSet<EmailChallenge> Challenges => Set<EmailChallenge>();
    public DbSet<MailJob> MailJobs => Set<MailJob>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        model.Entity<User>().HasIndex(x => x.NormalizedEmail).IsUnique();
        model.Entity<User>().Property(x => x.NormalizedEmail).HasMaxLength(254);
        model.Entity<User>().Property(x => x.SecurityVersion).IsConcurrencyToken();
        model.Entity<LoginSession>().HasIndex(x => x.RefreshHash).IsUnique();
        model.Entity<LoginSession>().HasIndex(x => new { x.UserId, x.FamilyId });
        model.Entity<EmailChallenge>().HasIndex(x => x.TokenHash).IsUnique();
        model.Entity<MailJob>().HasIndex(x => x.DeliveredAt);
    }
}
