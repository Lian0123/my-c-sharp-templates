#!/usr/bin/env python3
import json,subprocess,time,sys
required={s+'-'+kind for s in ['auth','account','message'] for kind in ['postgres','redis']}|{'rabbitmq','garage','mailpit'}
if sys.argv[1:]==['--all']:
    required|={'auth','account','message','gateway','web'}
elif sys.argv[1:]:
    sys.exit('Usage: wait-containers.py [--all]')
deadline=time.monotonic()+180
while time.monotonic()<deadline:
    raw=subprocess.check_output(['docker','compose','-f','docker-compose.yml','-f','docker-compose.test.yml','ps','--format','json'],text=True)
    try:
        items=json.loads(raw);items=items if isinstance(items,list) else [items]
    except json.JSONDecodeError:items=[json.loads(line) for line in raw.splitlines() if line.strip()]
    healthy={x['Service'] for x in items if x['State']=='running' and x.get('Health')=='healthy'}
    if required<=healthy:print('All required containers are healthy.');sys.exit(0)
    time.sleep(1)
sys.exit('Dependencies not healthy: '+', '.join(sorted(required-healthy)))
