using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace MicroserviceStarter.Account.Infrastructure;

public sealed class DesignTimeFactory : IDesignTimeDbContextFactory<AccountDbContext>
{
    public AccountDbContext CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<AccountDbContext>()
        .UseNpgsql("Host=localhost;Database=account;Username=account").Options);
}
