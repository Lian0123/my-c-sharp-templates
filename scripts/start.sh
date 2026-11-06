#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
./scripts/init.sh
docker compose up -d --build
python3 scripts/wait-http.py "http://localhost:${HTTP_PORT:-8080}/health/ready" 240
echo 'Relay: http://localhost:8080 | Swagger: http://localhost:8080/docs | Mailpit: http://localhost:8025'
