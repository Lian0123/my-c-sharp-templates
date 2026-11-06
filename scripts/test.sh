#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
./scripts/init.sh
export COMPOSE_PROJECT_NAME="${TEST_PROJECT_NAME:-microservice-starter-tests}"
export HTTP_PORT="${TEST_HTTP_PORT:-18080}" MAILPIT_PORT="${TEST_MAILPIT_PORT:-18025}"
export RABBITMQ_MGMT_PORT="${TEST_RABBIT_MGMT_PORT:-25672}" TEST_RABBIT_MGMT_PORT="${TEST_RABBIT_MGMT_PORT:-25672}"
mkdir -p artifacts
rm -rf artifacts/backend
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d auth-postgres account-postgres message-postgres auth-redis account-redis message-redis rabbitmq garage mailpit
python3 scripts/wait-containers.py
if [ "${DOCKER_TESTS:-0}" = 1 ]; then
  docker compose -f docker-compose.yml -f docker-compose.test.yml -f docker-compose.tools.yml run --rm backend-tests
  docker compose -f docker-compose.yml -f docker-compose.tools.yml run --rm web-tests
  docker compose -f docker-compose.yml -f docker-compose.tools.yml run --rm web-tests node --test /workspace/tools/Operations/deadletter.test.mjs
else
  dotnet restore MicroserviceStarter.slnx --locked-mode
  RUN_INTEGRATION=1 dotnet test tests/MicroserviceStarter.Tests -c Release --no-restore --collect:'XPlat Code Coverage' --settings coverage.runsettings --results-directory artifacts/backend --logger 'trx;LogFileName=backend.trx'
  (cd src/Web && npm ci && npm run lint && npm run build && npm run coverage)
  node --test tools/Operations/deadletter.test.mjs
fi
python3 scripts/check-coverage.py
