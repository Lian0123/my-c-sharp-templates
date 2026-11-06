#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
dotnet tool restore
for service in Auth Account Message; do
  dotnet ef migrations add "${1:-Initial}" --project "src/Services/$service/$service.Infrastructure" --startup-project "src/Services/$service/$service.Api" --output-dir Migrations
done
