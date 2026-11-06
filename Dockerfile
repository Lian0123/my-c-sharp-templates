# syntax=docker/dockerfile:1.4
FROM mcr.microsoft.com/dotnet/sdk:10.0.403 AS build
WORKDIR /source
COPY Directory.Build.props Directory.Packages.props global.json MicroserviceStarter.slnx ./
COPY src/Gateway/Gateway.csproj src/Gateway/packages.lock.json src/Gateway/
COPY src/Services/Account/Account.Api/Account.Api.csproj src/Services/Account/Account.Api/packages.lock.json src/Services/Account/Account.Api/
COPY src/Services/Account/Account.Application/Account.Application.csproj src/Services/Account/Account.Application/packages.lock.json src/Services/Account/Account.Application/
COPY src/Services/Account/Account.Domain/Account.Domain.csproj src/Services/Account/Account.Domain/packages.lock.json src/Services/Account/Account.Domain/
COPY src/Services/Account/Account.Infrastructure/Account.Infrastructure.csproj src/Services/Account/Account.Infrastructure/packages.lock.json src/Services/Account/Account.Infrastructure/
COPY src/Services/Auth/Auth.Api/Auth.Api.csproj src/Services/Auth/Auth.Api/packages.lock.json src/Services/Auth/Auth.Api/
COPY src/Services/Auth/Auth.Application/Auth.Application.csproj src/Services/Auth/Auth.Application/packages.lock.json src/Services/Auth/Auth.Application/
COPY src/Services/Auth/Auth.Domain/Auth.Domain.csproj src/Services/Auth/Auth.Domain/packages.lock.json src/Services/Auth/Auth.Domain/
COPY src/Services/Auth/Auth.Infrastructure/Auth.Infrastructure.csproj src/Services/Auth/Auth.Infrastructure/packages.lock.json src/Services/Auth/Auth.Infrastructure/
COPY src/Services/Message/Message.Api/Message.Api.csproj src/Services/Message/Message.Api/packages.lock.json src/Services/Message/Message.Api/
COPY src/Services/Message/Message.Application/Message.Application.csproj src/Services/Message/Message.Application/packages.lock.json src/Services/Message/Message.Application/
COPY src/Services/Message/Message.Domain/Message.Domain.csproj src/Services/Message/Message.Domain/packages.lock.json src/Services/Message/Message.Domain/
COPY src/Services/Message/Message.Infrastructure/Message.Infrastructure.csproj src/Services/Message/Message.Infrastructure/packages.lock.json src/Services/Message/Message.Infrastructure/
COPY src/Shared/BuildingBlocks/BuildingBlocks.csproj src/Shared/BuildingBlocks/packages.lock.json src/Shared/BuildingBlocks/
COPY src/Shared/Contracts/Contracts.csproj src/Shared/Contracts/packages.lock.json src/Shared/Contracts/
COPY tests/MicroserviceStarter.Tests/MicroserviceStarter.Tests.csproj tests/MicroserviceStarter.Tests/packages.lock.json tests/MicroserviceStarter.Tests/
RUN --mount=type=cache,target=/root/.nuget/packages dotnet restore MicroserviceStarter.slnx --locked-mode
COPY src/Shared src/Shared
COPY src/Services src/Services
COPY src/Gateway src/Gateway
COPY tests tests
ARG PROJECT
RUN --mount=type=cache,target=/root/.nuget/packages dotnet publish "$PROJECT" -c Release --no-restore -o /publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0.14 AS runtime
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && mkdir -p /data/keys && chown app:app /data/keys
WORKDIR /app
COPY --from=build /publish .
COPY --chmod=755 docker/dotnet-entrypoint.sh /entrypoint.sh
ARG DLL
ENV SERVICE_DLL=$DLL ASPNETCORE_HTTP_PORTS=8080
USER app
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=4s --start-period=40s CMD curl -fsS http://localhost:8080/health/ready || exit 1
ENTRYPOINT ["/entrypoint.sh"]
