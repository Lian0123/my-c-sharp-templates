using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace MicroserviceStarter.Message.Infrastructure;

public sealed class DesignTimeFactory : IDesignTimeDbContextFactory<MessageDbContext>
{
    public MessageDbContext CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<MessageDbContext>()
        .UseNpgsql("Host=localhost;Database=message;Username=message").Options);
}
