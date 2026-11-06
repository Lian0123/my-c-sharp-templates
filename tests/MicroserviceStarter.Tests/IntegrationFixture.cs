extern alias AuthApi;
extern alias AccountApi;
extern alias MessageApi;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using MicroserviceStarter.Auth.Application;
using MicroserviceStarter.Auth.Infrastructure;
using MicroserviceStarter.Account.Infrastructure;
using MicroserviceStarter.BuildingBlocks;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Infrastructure;
using Npgsql;

namespace MicroserviceStarter.Tests;

public sealed class IntegrationFactAttribute : FactAttribute
{
    public IntegrationFactAttribute() { if (Environment.GetEnvironmentVariable("RUN_INTEGRATION") != "1") Skip = "Run scripts/test.sh with Docker dependencies."; }
}
[CollectionDefinition("Integration", DisableParallelization = true)]
public sealed class IntegrationCollection : ICollectionFixture<IntegrationFixture>;
public sealed record TestLogin(HttpClient Client, LoginResult Login, string RefreshToken);

public sealed class TestFactory<T>(Dictionary<string, string?> settings, Func<HttpMessageHandler>? auth = null) : WebApplicationFactory<T> where T : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(settings));
        builder.ConfigureTestServices(services =>
        {
            // Start workers explicitly after all three isolated databases have been migrated.
            foreach (var item in services.Where(x => x.ServiceType == typeof(IHostedService) &&
                (x.ImplementationType?.IsSubclassOf(typeof(BackgroundService)) == true || x.ImplementationFactory is not null)).ToArray()) services.Remove(item);
            if (auth is not null)
            {
                services.RemoveAll<ISessionValidator>();
                services.AddHttpClient<ISessionValidator, RemoteSessionValidator>().ConfigurePrimaryHttpMessageHandler(auth);
            }
        });
    }
}

public sealed class IntegrationFixture : IAsyncLifetime
{
    public const string Password = "Integration-Password-123!";
    public TestFactory<AuthApi::Program> Auth { get; private set; } = null!;
    public TestFactory<AccountApi::Program> Account { get; private set; } = null!;
    public TestFactory<MessageApi::Program> Message { get; private set; } = null!;
    public IReadOnlyDictionary<string, string> Env { get; private set; } = null!;
    private readonly List<BackgroundService> workers = [];
    private readonly string suffix = Guid.NewGuid().ToString("N");
    private string vhost = "";
    private HttpClient management = null!;
    private readonly List<(string Connection, string Name)> databases = [];
    private static bool ContainerDns => Environment.GetEnvironmentVariable("TEST_CONTAINER_DNS") == "1";
    public async Task InitializeAsync()
    {
        if (Environment.GetEnvironmentVariable("RUN_INTEGRATION") != "1") return;
        Env = File.ReadAllLines(Path.Combine(ArchitectureTests.Root, ".env")).Where(x => !x.StartsWith('#') && x.Contains('='))
            .Select(x => x.Split('=', 2)).ToDictionary(x => x[0], x => x[1]);
        management = new HttpClient { BaseAddress = new Uri(ContainerDns ? "http://rabbitmq:15672" : "http://127.0.0.1:" + (Environment.GetEnvironmentVariable("TEST_RABBIT_MGMT_PORT") ?? "25672")) };
        management.DefaultRequestHeaders.Authorization = new("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes("starter:" + Env["RABBITMQ_PASSWORD"])));
        vhost = "integration_" + suffix;
        (await management.PutAsJsonAsync("/api/vhosts/" + vhost, new { })).EnsureSuccessStatusCode();
        (await management.PutAsJsonAsync($"/api/permissions/{vhost}/starter", new { configure = ".*", write = ".*", read = ".*" })).EnsureSuccessStatusCode();
        var auth = await Settings("Auth", 15431, 16379);
        var account = await Settings("Account", 15432, 16380);
        var message = await Settings("Message", 15433, 16381);
        Auth = new(auth);
        Account = new(account, () => Auth.Server.CreateHandler());
        Message = new(message, () => Auth.Server.CreateHandler());
        await Database<AuthDbContext, bool>(Auth.Services, async db => { await db.Database.MigrateAsync(); return true; });
        await Database<AccountDbContext, bool>(Account.Services, async db => { await db.Database.MigrateAsync(); return true; });
        await Database<MessageDbContext, bool>(Message.Services, async db => { await db.Database.MigrateAsync(); return true; });
        await using (var scope = Auth.Services.CreateAsyncScope()) await scope.ServiceProvider.GetRequiredService<AuthService>().Seed(default);
        foreach (var provider in new[] { Auth.Services, Account.Services, Message.Services })
        {
            var publisher = ActivatorUtilities.CreateInstance<OutboxPublisher>(provider);
            workers.Add(publisher);
            if (provider.GetRequiredService<IConfiguration>()["ServiceName"] != "Auth")
            {
                var consumer = ActivatorUtilities.CreateInstance<EventConsumer>(provider);
                workers.Add(consumer); await consumer.StartAsync(default);
            }
            await publisher.StartAsync(default);
        }
        var connections = Message.Services.GetRequiredService<MessageApi::MicroserviceStarter.Message.Api.ConnectionRegistry>();
        workers.Add(connections); await connections.StartAsync(default);
        await Wait(async () => await Database<AccountDbContext, bool>(Account.Services, db => db.Profiles.AnyAsync()));
    }
    private async Task<Dictionary<string, string?>> Settings(string service, int pgPort, int redisPort)
    {
        var key = service.ToUpperInvariant(); var name = "integration_" + service.ToLowerInvariant() + "_" + suffix;
        var pgHost = ContainerDns ? service.ToLowerInvariant() + "-postgres" : "127.0.0.1";
        var redisHost = ContainerDns ? service.ToLowerInvariant() + "-redis" : "127.0.0.1";
        var connection = $"Host={pgHost};Port={(ContainerDns ? 5432 : pgPort)};Username={service.ToLowerInvariant()};Password={Env[key + "_DB_PASSWORD"]};Database=";
        await using (var admin = new NpgsqlConnection(connection + "postgres"))
        { await admin.OpenAsync(); await new NpgsqlCommand($"CREATE DATABASE \"{name}\"", admin).ExecuteNonQueryAsync(); }
        databases.Add((connection + "postgres", name));
        return new()
        {
            ["ConnectionStrings:Postgres"] = connection + name,
            ["ConnectionStrings:Redis"] = $"{redisHost}:{(ContainerDns ? 6379 : redisPort)},password={Env[key + "_REDIS_PASSWORD"]},abortConnect=false",
            ["ConnectionStrings:RabbitMQ"] = $"amqp://starter:{Env["RABBITMQ_PASSWORD"]}@{(ContainerDns ? "rabbitmq:5672" : "127.0.0.1:15673")}/{vhost}",
            ["Rabbit:RetryDelayMilliseconds"] = "100",
            ["Jwt:PublicKeyPath"] = Path.Combine(ArchitectureTests.Root, ".local/keys/public.pem"),
            ["Jwt:PrivateKeyPath"] = Path.Combine(ArchitectureTests.Root, ".local/keys/private.pem"),
            ["Auth:Url"] = "http://localhost",
            ["Message:Url"] = "http://127.0.0.1:1",
            ["Internal:AuthKey"] = Env["INTERNAL_AUTH_KEY"],
            ["Internal:AccountKey"] = Env["INTERNAL_ACCOUNT_KEY"],
            ["Internal:MessageKey"] = Env["INTERNAL_MESSAGE_KEY"],
            ["Internal:GatewayKey"] = Env["INTERNAL_GATEWAY_KEY"],
            ["Bootstrap:Email"] = "integration-admin@example.test",
            ["Bootstrap:Password"] = Password,
            ["DataProtection:Path"] = Path.Combine(ArchitectureTests.Root, ".local/integration-keys/" + suffix),
            ["Smtp:Host"] = ContainerDns ? "mailpit" : "127.0.0.1",
            ["Smtp:Port"] = ContainerDns ? "1025" : "11025",
            ["PublicUrl"] = "http://localhost:8080",
            ["S3:Endpoint"] = ContainerDns ? "http://garage:3900" : "http://127.0.0.1:13900",
            ["S3:Bucket"] = "attachments",
            ["S3:AccessKey"] = Env["GARAGE_ACCESS_KEY"],
            ["S3:SecretKey"] = Env["GARAGE_SECRET_KEY"]
        };
    }
    public async Task<TestLogin> Register(string? email = null, bool verify = true)
    {
        email ??= Guid.NewGuid().ToString("N") + "@example.test";
        using var client = Auth.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest(email, Password, "測試會員"));
        Assert.Equal(System.Net.HttpStatusCode.Accepted, response.StatusCode);
        if (verify)
        {
            var token = await ChallengeToken(email, "驗證您的 Email");
            Assert.Equal(System.Net.HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/verify", new TokenRequest(token))).StatusCode);
            return await Login(email);
        }
        return new(client, null!, "");
    }
    public async Task<string> ChallengeToken(string email, string subject)
    {
        await using var scope = Auth.Services.CreateAsyncScope();
        var job = await scope.ServiceProvider.GetRequiredService<AuthDbContext>().MailJobs.Where(x => x.Recipient == email && x.Subject == subject).OrderByDescending(x => x.CreatedAt).FirstAsync();
        var body = scope.ServiceProvider.GetRequiredService<IDataProtectionProvider>().CreateProtector("auth-mail-v1").Unprotect(job.ProtectedBody);
        return body.Split("token=")[1].Trim();
    }
    public async Task<TestLogin> Login(string email = "integration-admin@example.test", string password = Password)
    {
        var client = Auth.CreateClient(); client.DefaultRequestHeaders.Add("X-Forwarded-For", Guid.NewGuid().ToString());
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, password));
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var login = (await response.Content.ReadFromJsonAsync<LoginResult>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", login.AccessToken);
        client.DefaultRequestHeaders.Add("X-CSRF-Token", login.CsrfToken);
        var cookie = response.Headers.GetValues("Set-Cookie").First(x => x.StartsWith("refresh_token=", StringComparison.Ordinal)).Split(';')[0].Split('=', 2)[1];
        return new(client, login, cookie);
    }
    public HttpClient Client<T>(WebApplicationFactory<T> factory, TestLogin login) where T : class
    { var client = factory.CreateClient(); client.DefaultRequestHeaders.Authorization = new("Bearer", login.Login.AccessToken); return client; }
    public static async Task<T> Database<TDb, T>(IServiceProvider services, Func<TDb, Task<T>> work) where TDb : DbContext
    { await using var scope = services.CreateAsyncScope(); return await work(scope.ServiceProvider.GetRequiredService<TDb>()); }
    public static async Task Wait(Func<Task<bool>> condition, int seconds = 20)
    {
        var end = DateTimeOffset.UtcNow.AddSeconds(seconds);
        while (DateTimeOffset.UtcNow < end) { if (await condition()) return; await Task.Delay(100); }
        Assert.Fail("Timed out waiting for an asynchronous invariant");
    }
    public async Task DisposeAsync()
    {
        if (Auth is null) return;
        foreach (var worker in workers) { await worker.StopAsync(new CancellationTokenSource(TimeSpan.FromSeconds(10)).Token); worker.Dispose(); }
        if (Message is not null)
        {
            await using var scope = Message.Services.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<MessageDbContext>();
            var storage = scope.ServiceProvider.GetRequiredService<IObjectStorage>();
            foreach (var key in await db.Attachments.Select(x => x.ObjectKey).ToListAsync()) await storage.Delete(key, default);
        }
        if (Message is not null) await Message.DisposeAsync();
        if (Account is not null) await Account.DisposeAsync();
        await Auth.DisposeAsync();
        NpgsqlConnection.ClearAllPools();
        foreach (var (connection, name) in databases)
        {
            await using var admin = new NpgsqlConnection(connection); await admin.OpenAsync();
            await new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{name}\" WITH (FORCE)", admin).ExecuteNonQueryAsync();
        }
        var keys = Path.Combine(ArchitectureTests.Root, ".local/integration-keys/" + suffix);
        if (Directory.Exists(keys)) Directory.Delete(keys, true);
        if (management is not null) { await management.DeleteAsync("/api/vhosts/" + vhost); management.Dispose(); }
    }
}
