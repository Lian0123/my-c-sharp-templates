#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
export COMPOSE_PROJECT_NAME="${TEST_PROJECT_NAME:-microservice-starter-tests}"
export HTTP_PORT="${TEST_HTTP_PORT:-18080}" MAILPIT_PORT="${TEST_MAILPIT_PORT:-18025}" RABBITMQ_MGMT_PORT="${TEST_RABBIT_MGMT_PORT:-25672}"
export ASPNETCORE_ENVIRONMENT=Development
export BASE_URL="${BASE_URL:-http://localhost:$HTTP_PORT}" MAILPIT_URL="${MAILPIT_URL:-http://localhost:$MAILPIT_PORT}"
export PUBLIC_URL="$BASE_URL"
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --build
python3 scripts/wait-http.py "$BASE_URL/health/ready" 240
python3 scripts/wait-containers.py --all
if [ "${DOCKER_TESTS:-0}" = 1 ]; then
  docker compose -f docker-compose.yml -f docker-compose.tools.yml run --rm e2e-tests
else
  (cd src/Web && npx playwright install chromium && npm run e2e)
fi
