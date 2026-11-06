using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MicroserviceStarter.Account.Application;
using MicroserviceStarter.Account.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Infrastructure;
using StackExchange.Redis;
using static MicroserviceStarter.Tests.IntegrationFixture;
using static MicroserviceStarter.Tests.AuthEdgeIntegrationTests;

namespace MicroserviceStarter.Tests;

[Collection("Integration")]
public class ProjectionAndFailureIntegrationTests(IntegrationFixture fixture)
{
    [IntegrationFact]
    public async Task ProjectionVersionsIgnoreDuplicatesAndOldEventsIncludingProfileBeforeIdentity()
    {
        var uid = Guid.NewGuid();
        await using (var scope = fixture.Account.Services.CreateAsyncScope())
        {
            var handler = scope.ServiceProvider.GetRequiredService<IIntegrationHandler>(); var db = scope.ServiceProvider.GetRequiredService<AccountDbContext>();
            IntegrationEvent Change(long version, bool active) => new(Guid.NewGuid(), EventTypes.IdentityChanged, 1, uid, version, DateTimeOffset.UtcNow, "test", Json.Write(new IdentityChanged(uid, "事件會員", active, version)));
            await handler.Handle(Change(5, true), default); await db.SaveChangesAsync();
            await handler.Handle(Change(5, false), default); await handler.Handle(Change(4, false), default); await db.SaveChangesAsync();
            Assert.True((await db.Profiles.SingleAsync(x => x.Id == uid)).Active);
            await Assert.ThrowsAsync<InvalidDataException>(() => handler.Handle(Change(6, false) with { Type = "unknown" }, default));
        }
        await using (var scope = fixture.Message.Services.CreateAsyncScope())
        {
            var handler = scope.ServiceProvider.GetRequiredService<IIntegrationHandler>(); var db = scope.ServiceProvider.GetRequiredService<MessageDbContext>(); var id = Guid.NewGuid();
            IntegrationEvent Profile(long version) => new(Guid.NewGuid(), EventTypes.ProfileChanged, 1, id, version, DateTimeOffset.UtcNow, "test", Json.Write(new ProfileChanged(id, "公開名稱", "", true, version)));
            IntegrationEvent Identity(long version) => new(Guid.NewGuid(), EventTypes.IdentityChanged, 1, id, version, DateTimeOffset.UtcNow, "test", Json.Write(new IdentityChanged(id, "初始名稱", false, version)));
            await handler.Handle(Profile(10), default); await db.SaveChangesAsync();
            await handler.Handle(Identity(20), default); await db.SaveChangesAsync();
            await handler.Handle(Identity(19), default); await handler.Handle(Profile(10), default); await handler.Handle(Profile(11), default); await db.SaveChangesAsync();
            var user = await db.Users.SingleAsync(x => x.Id == id); Assert.False(user.Active); Assert.Equal("公開名稱", user.DisplayName); Assert.Equal(20, user.IdentityVersion);
            await Assert.ThrowsAsync<InvalidDataException>(() => handler.Handle(Profile(12) with { Type = "unknown" }, default));
        }
    }
    [IntegrationFact]
    public async Task ProfileCacheFailuresAndCorruptionFallBackToPostgresAndOwnershipIsCheckedInTheService()
    {
        var login = await fixture.Register(); var actor = Actor(login);
        await Wait(async () => await Database<AccountDbContext, bool>(fixture.Account.Services, db => db.Profiles.AnyAsync(x => x.Id == actor.UserId)));
        await using var scope = fixture.Account.Services.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<AccountDbContext>();
        var actual = scope.ServiceProvider.GetRequiredService<IAccountService>(); var cache = scope.ServiceProvider.GetRequiredService<IConnectionMultiplexer>().GetDatabase();
        await cache.StringSetAsync("account:profile:" + actor.UserId, "invalid JSON"); Assert.NotNull(await actual.Me(actor, default));
        await cache.StringSetAsync("account:profile:" + actor.UserId, "null"); Assert.NotNull(await actual.Me(actor, default));
        using var disconnected = await ConnectionMultiplexer.ConnectAsync(new ConfigurationOptions { EndPoints = { "127.0.0.1:1" }, AbortOnConnectFail = false, ConnectTimeout = 50, AsyncTimeout = 50, ConnectRetry = 0 });
        var service = new AccountService(db, disconnected);
        Assert.NotNull(await service.Me(actor, default));
        Assert.Equal("快取故障仍可更新", (await service.Update(actor, actor.UserId, new ProfileRequest("快取故障仍可更新", ""), null, default)).DisplayName);
        Assert.Null(await service.Me(actor with { UserId = Guid.NewGuid() }, default));
        Assert.Equal(Errors.Forbidden, (await Assert.ThrowsAsync<AppException>(() => service.Update(actor, Guid.NewGuid(), new("越權修改", ""), null, default))).Error);
        Assert.NotEmpty(await service.Search(" ", 100, default));
    }
    [IntegrationFact]
    public async Task ObjectStoreFailuresReturnUnavailableInsteadOfLeakingStorageDetails()
    {
        await using var scope = fixture.Message.Services.CreateAsyncScope();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["S3:Bucket"] = "missing-" + Guid.NewGuid().ToString("N") }).Build();
        var storage = new ObjectStorage(scope.ServiceProvider.GetRequiredService<IAmazonS3>(), config);
        using var data = new MemoryStream("data"u8.ToArray());
        Assert.Equal(Errors.Unavailable, (await Assert.ThrowsAsync<AppException>(() => storage.Put("a", data, "text/plain", default))).Error);
        Assert.Equal(Errors.Unavailable, (await Assert.ThrowsAsync<AppException>(() => storage.Get("a", default))).Error);
    }
}
