using Microsoft.EntityFrameworkCore;
using MicroserviceStarter.Account.Domain;
using MicroserviceStarter.BuildingBlocks;

namespace MicroserviceStarter.Account.Infrastructure;

public sealed class AccountDbContext(DbContextOptions<AccountDbContext> options) : PlatformDbContext(options)
{
    public DbSet<Profile> Profiles => Set<Profile>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        model.Entity<Profile>().Property(x => x.DisplayName).HasMaxLength(50);
        model.Entity<Profile>().Property(x => x.Version).IsConcurrencyToken();
    }
}
