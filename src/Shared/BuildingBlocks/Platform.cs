using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using MicroserviceStarter.Contracts;
using Serilog;
using Serilog.Formatting.Compact;
using StackExchange.Redis;

namespace MicroserviceStarter.BuildingBlocks;

public static class Json
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);
    public static string Write<T>(T value) => JsonSerializer.Serialize(value, Options);
    public static T Read<T>(string value) => JsonSerializer.Deserialize<T>(value, Options)
        ?? throw new AppException(Errors.Validation);
}

public interface ISessionValidator
{
    Task<IReadOnlyList<SessionState>> Check(IReadOnlyList<SessionProbe> probes, CancellationToken ct);
}

public sealed class RemoteSessionValidator(HttpClient http, IConfiguration config) : ISessionValidator
{
    public async Task<IReadOnlyList<SessionState>> Check(IReadOnlyList<SessionProbe> probes, CancellationToken ct)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, config["Auth:Url"] + "/internal/sessions/check")
            { Content = JsonContent.Create(probes) };
            var service = config["ServiceName"]!;
            request.Headers.Add("X-Service-Id", service);
            request.Headers.Add("X-Service-Key", config[$"Internal:{service}Key"]);
            using var response = await http.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<SessionState[]>(ct) ?? [];
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        { throw new AppException(Errors.Unavailable, "無法驗證登入狀態，請稍後重試"); }
    }
}

public static class Platform
{
    public static void AddPlatform(this WebApplicationBuilder builder, string name, bool onlineValidation = true)
    {
        builder.Configuration["ServiceName"] = name;
        builder.Host.UseSerilog((_, logger) => logger.MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Warning)
            .Enrich.FromLogContext().Enrich.WithProperty("service", name)
            .WriteTo.Console(new RenderedCompactJsonFormatter()));
        builder.Services.AddHttpClient<ISessionValidator, RemoteSessionValidator>(c => c.Timeout = TimeSpan.FromSeconds(3));
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddProblemDetails();
        builder.Services.AddOpenApi("v1", options =>
        {
            options.AddSchemaTransformer((schema, context, _) =>
            {
                var type = context.JsonTypeInfo.Type;
                if (type.Name.EndsWith("View", StringComparison.Ordinal) || type.Name is "LoginResult" or "Actor" or "ApiProblem"
                    || type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Page<>))
                    schema.Required = schema.Properties?.Keys.Where(key => key != "errors").ToHashSet() ?? [];
                return Task.CompletedTask;
            });
            options.AddDocumentTransformer((document, _, _) =>
        {
            document.Info.Title = name + " API";
            document.Info.Version = "v1";
            document.Servers = [new Microsoft.OpenApi.OpenApiServer { Url = "/" }];
            document.Components ??= new();
            document.Components.SecuritySchemes ??= new Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();
            document.Components.SecuritySchemes["Bearer"] = new Microsoft.OpenApi.OpenApiSecurityScheme
            { Type = Microsoft.OpenApi.SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT" };
            return Task.CompletedTask;
        });
            options.AddOperationTransformer(async (operation, context, ct) =>
            {
                if (context.Description.ActionDescriptor.EndpointMetadata.OfType<Microsoft.AspNetCore.Authorization.IAuthorizeData>().Any())
                    operation.Security = [new() { [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", context.Document)] = [] }];
                var schema = await context.GetOrCreateSchemaAsync(typeof(ApiProblem), null, ct);
                operation.Responses ??= new();
                foreach (var group in Errors.All.GroupBy(x => x.Status))
                    operation.Responses[group.Key.ToString()] = new Microsoft.OpenApi.OpenApiResponse
                    {
                        Description = string.Join("；", group.Select(x => x.Code + " " + x.Title)),
                        Content = new Dictionary<string, Microsoft.OpenApi.OpenApiMediaType>
                        {
                            ["application/problem+json"] = new()
                            {
                                Schema = schema,
                                Example = System.Text.Json.Nodes.JsonNode.Parse(Json.Write(new
                                {
                                    type = "about:blank",
                                    title = group.First().Title,
                                    status = group.Key,
                                    detail = group.First().Title,
                                    instance = "/api/v1/example",
                                    errorCode = group.First().Code,
                                    traceId = "0123456789abcdef0123456789abcdef",
                                    source = name
                                }))
                            }
                        }
                    };
            });
        });
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            var keyPath = builder.Configuration["Jwt:PublicKeyPath"];
            if (!string.IsNullOrEmpty(keyPath) && File.Exists(keyPath))
            {
                var rsa = RSA.Create();
                rsa.ImportFromPem(File.ReadAllText(keyPath));
                options.TokenValidationParameters = new()
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(rsa),
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "MicroserviceStarter",
                    ValidateAudience = true,
                    ValidAudience = "microservice-api",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    RoleClaimType = "role",
                    NameClaimType = "sub",
                    ValidAlgorithms = [SecurityAlgorithms.RsaSha256]
                };
            }
            options.Events = new()
            {
                OnMessageReceived = context =>
                {
                    if (context.HttpContext.Request.Path.StartsWithSegments("/hubs/chat"))
                        context.Token = context.Request.Query["access_token"];
                    return Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    if (!onlineValidation) return;
                    var actor = context.Principal!.Actor();
                    var states = await context.HttpContext.RequestServices.GetRequiredService<ISessionValidator>()
                        .Check([new(actor.SessionId, actor.UserId, actor.SecurityVersion)], context.HttpContext.RequestAborted);
                    if (!states.Any(x => x.SessionId == actor.SessionId && x.Active)) context.Fail("Session revoked");
                },
                OnChallenge = async context =>
                { context.HandleResponse(); await WriteProblem(context.HttpContext, Errors.Unauthenticated); },
                OnForbidden = context => WriteProblem(context.HttpContext, Errors.Forbidden)
            };
        });
        builder.Services.AddAuthorization(options => options.AddPolicy("Admin", policy => policy.RequireRole("Admin")));
    }

    public static void AddRedis(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<IConnectionMultiplexer>(_ =>
        {
            var options = ConfigurationOptions.Parse(config.GetConnectionString("Redis")
                ?? throw new InvalidOperationException("Redis connection is required"));
            options.AbortOnConnectFail = false;
            options.ConnectTimeout = 3000;
            options.AsyncTimeout = 3000;
            return ConnectionMultiplexer.Connect(options);
        });
    }

    public static void UsePlatform(this WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            var started = Stopwatch.GetTimestamp();
            context.Response.Headers["X-Trace-Id"] = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["Referrer-Policy"] = "no-referrer";
            try
            {
                await next();
                if (context.Response.StatusCode >= 400 && !context.Response.HasStarted && context.Response.ContentType is null)
                    await WriteProblem(context, Errors.ForStatus(context.Response.StatusCode));
            }
            catch (AppException ex) when (!context.Response.HasStarted)
            { await WriteProblem(context, ex.Error, ex.Message, ex.Fields); }
            catch (Exception ex) when (ex is BadHttpRequestException or JsonException)
            { if (!context.Response.HasStarted) await WriteProblem(context, ex is BadHttpRequestException bad ? Errors.ForStatus(bad.StatusCode) : Errors.Validation); }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested) { }
            catch (Exception ex) when (!context.Response.HasStarted)
            {
                var error = ex switch
                {
                    Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException => Errors.Conflict,
                    HttpRequestException or RedisException or System.Data.Common.DbException => Errors.Unavailable,
                    _ => Errors.Unexpected
                };
                app.Logger.LogError("Request failed: {ExceptionType}, trace {TraceId}, stack {ErrorStack}", ex.GetType().Name, context.TraceIdentifier, ex.StackTrace);
                await WriteProblem(context, error);
            }
            finally
            {
                app.Logger.LogInformation("HTTP {Method} {Path} {Status} in {ElapsedMs}ms trace {TraceId}",
                    context.Request.Method, context.Request.Path.Value, context.Response.StatusCode,
                    Stopwatch.GetElapsedTime(started).TotalMilliseconds, Activity.Current?.TraceId.ToString());
            }
        });
        app.UseAuthentication();
        app.UseAuthorization();
        if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("OpenApi:Enabled"))
        {
            app.MapOpenApi();
            app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "v1"));
        }
        app.MapGet("/health/live", () => Results.Ok(new { status = "healthy" })).ExcludeFromDescription();
        app.MapGet("/api/v1/errors", () => Errors.All).ExcludeFromDescription();
    }

    public static async Task WriteProblem(HttpContext context, ErrorDefinition error, string? detail = null,
        IDictionary<string, string[]>? fields = null)
    {
        context.Response.Clear();
        context.Response.StatusCode = error.Status;
        var extensions = new Dictionary<string, object?>
        {
            ["errorCode"] = error.Code,
            ["traceId"] = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier,
            ["source"] = context.RequestServices.GetRequiredService<IConfiguration>()["ServiceName"]
        };
        if (fields is not null) extensions["errors"] = fields;
        await Results.Problem(statusCode: error.Status, title: error.Title, detail: detail ?? error.Title,
            instance: context.Request.Path, extensions: extensions).ExecuteAsync(context);
    }

    public static Actor Actor(this ClaimsPrincipal principal)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub"), out var uid)
            || !Guid.TryParse(principal.FindFirstValue("sid"), out var sid)
            || !long.TryParse(principal.FindFirstValue("ver"), out var version)) throw new AppException(Errors.Unauthenticated);
        return new(uid, sid, version, principal.FindFirstValue("role") ?? "User");
    }

    public static T Validate<T>(this T input) where T : notnull
    {
        var results = new List<ValidationResult>();
        if (!Validator.TryValidateObject(input, new ValidationContext(input), results, true))
            throw new AppException(Errors.Validation, fields: results.SelectMany(r => r.MemberNames.DefaultIfEmpty("request")
                .Select(name => (name, r.ErrorMessage ?? "輸入不正確"))).GroupBy(x => x.name)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Item2).ToArray()));
        return input;
    }

    public static void RequireInternal(this HttpContext context)
    {
        var id = context.Request.Headers["X-Service-Id"].ToString();
        if (id is not ("Auth" or "Account" or "Message" or "Gateway")) throw new AppException(Errors.Forbidden);
        var expected = context.RequestServices.GetRequiredService<IConfiguration>()[$"Internal:{id}Key"];
        var actual = context.Request.Headers["X-Service-Key"].ToString();
        if (string.IsNullOrEmpty(expected) || !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(actual)))
            throw new AppException(Errors.Forbidden);
    }
}
