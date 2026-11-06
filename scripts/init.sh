#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ -f .env ]; then echo '.env already exists; refusing to replace credentials.'; exit 0; fi
umask 077
mkdir -p .local/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out .local/keys/private.pem 2>/dev/null
openssl pkey -in .local/keys/private.pem -pubout -out .local/keys/public.pem
# The parent directory is private on the host; read access inside the Auth container is required.
chmod 644 .local/keys/private.pem .local/keys/public.pem
cp .env.example .env
python3 - <<'PY'
from pathlib import Path
import secrets
p=Path('.env');text=p.read_text()
names=['AUTH_DB_PASSWORD','ACCOUNT_DB_PASSWORD','MESSAGE_DB_PASSWORD','AUTH_REDIS_PASSWORD','ACCOUNT_REDIS_PASSWORD','MESSAGE_REDIS_PASSWORD','RABBITMQ_PASSWORD','INTERNAL_AUTH_KEY','INTERNAL_ACCOUNT_KEY','INTERNAL_MESSAGE_KEY','INTERNAL_GATEWAY_KEY','GARAGE_SECRET_KEY','GARAGE_RPC_SECRET','BOOTSTRAP_PASSWORD']
for name in names:text=text.replace(name+'=\n',name+'='+secrets.token_hex(32)+'\n')
text=text.replace('GARAGE_ACCESS_KEY=\n','GARAGE_ACCESS_KEY=GK'+secrets.token_hex(12)+'\n');p.write_text(text)
values=dict(line.split('=',1) for line in text.splitlines() if '=' in line and not line.startswith('#'))
Path('.local/garage.toml').write_text('metadata_dir = "/data/meta"\ndata_dir = "/data/blocks"\nreplication_factor = 1\nrpc_bind_addr = "[::]:3901"\nrpc_public_addr = "garage:3901"\nrpc_secret = "'+values['GARAGE_RPC_SECRET']+'"\n[s3_api]\ns3_region = "garage"\napi_bind_addr = "[::]:3900"\nroot_domain = ".s3.garage.local"\n')
PY
echo 'Created local credentials and signing keys. Read BOOTSTRAP_EMAIL / BOOTSTRAP_PASSWORD in .env to sign in.'
