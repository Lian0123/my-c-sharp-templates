#!/usr/bin/env python3
"""Consistent maintenance-window backup/restore for this Compose project only."""
import datetime,hashlib,json,os,pathlib,shutil,subprocess,sys

ROOT=pathlib.Path(__file__).resolve().parent.parent
os.chdir(ROOT)
COMPOSE=['docker','compose']
APPS=['gateway','auth','account','message']
STORES={'garage':('garage','/data'),'rabbitmq':('rabbitmq','/var/lib/rabbitmq'),'auth-keys':('auth','/data/keys')}
def run(args,**kwargs):return subprocess.run(args,check=True,**kwargs)
def capture(args):return subprocess.check_output(args,text=True).strip()
def project():return json.loads(capture(COMPOSE+['config','--format','json']))['name']
def volume(service,destination):
    identifier=capture(COMPOSE+['ps','-a','-q',service])
    if not identifier:raise RuntimeError('Start the complete Compose stack before backup or restore.')
    data=json.loads(capture(['docker','inspect',identifier]))[0]
    return next(x['Name'] for x in data['Mounts'] if x['Destination']==destination and x['Type']=='volume')
def archive(name,vol,directory,restore=False):
    args=['docker','run','--rm','--network','none','--mount',f'type=volume,source={vol},target=/data'+('' if restore else ',readonly'),
          '--mount',f'type=bind,source={directory},target=/backup','redis:8.8.4-trixie']
    if restore:
        run(args+['sh','-c',f'rm -rf /data/* /data/.[!.]* /data/..?* && tar -C /data -xzf /backup/{name}.tar.gz'])
    else:run(args+['tar','-C','/data','-czf',f'/backup/{name}.tar.gz','.'])
def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''):h.update(block)
    return h.hexdigest()
def backup():
    os.umask(0o077)
    dest=(ROOT/'artifacts/backups'/datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')).resolve();dest.mkdir(parents=True)
    volumes={name:volume(*values) for name,values in STORES.items()}
    run(COMPOSE+['stop',*APPS])
    try:
        for service in ['auth','account','message']:
            with (dest/(service+'.dump')).open('wb') as stream:run(COMPOSE+['exec','-T',service+'-postgres','pg_dump','-U',service,'-d',service,'-Fc'],stdout=stream)
        run(COMPOSE+['stop','garage','rabbitmq'])
        for name,vol in volumes.items():archive(name,vol,dest)
        shutil.copy2('.env',dest/'.env');shutil.copytree('.local/keys',dest/'keys');shutil.copy2('.local/garage.toml',dest/'garage.toml')
        files={str(path.relative_to(dest)):sha(path) for path in dest.rglob('*') if path.is_file()}
        (dest/'manifest.json').write_text(json.dumps({'version':1,'project':project(),'sha256':files},indent=2)+'\n')
    finally:run(COMPOSE+['up','-d','garage','rabbitmq','auth','account','message','gateway'])
    print('Backup saved:',dest)
def restore(directory):
    dest=pathlib.Path(directory).resolve();manifest=json.loads((dest/'manifest.json').read_text())
    if manifest['version']!=1 or manifest['project']!=project():raise RuntimeError('Backup version/project does not match this Compose project.')
    for name,expected in manifest['sha256'].items():
        path=(dest/name).resolve()
        if dest not in path.parents or sha(path)!=expected:raise RuntimeError('Backup checksum failed: '+name)
    volumes={name:volume(*values) for name,values in STORES.items()}
    run(COMPOSE+['stop',*APPS,'garage','rabbitmq'])
    # Restore is explicit and destructive: callers selected the snapshot on the command line.
    for service in ['auth','account','message']:
        with (dest/(service+'.dump')).open('rb') as stream:run(COMPOSE+['exec','-T',service+'-postgres','pg_restore','-U',service,'-d',service,'--clean','--if-exists','--no-owner','--exit-on-error'],stdin=stream)
    for name,vol in volumes.items():archive(name,vol,dest,True)
    shutil.copy2(dest/'.env','.env');shutil.copytree(dest/'keys','.local/keys',dirs_exist_ok=True);shutil.copy2(dest/'garage.toml','.local/garage.toml')
    settings=dict(line.split('=',1) for line in (dest/'.env').read_text().splitlines() if line and not line.startswith('#') and '=' in line)
    for service in ['auth','account','message']:
        password=settings[service.upper()+'_DB_PASSWORD'].replace("'","''")
        sql=f"SET standard_conforming_strings=on; ALTER ROLE {service} PASSWORD '{password}';"
        run(COMPOSE+['exec','-T',service+'-postgres','psql','-U',service,'-d','postgres','-v','ON_ERROR_STOP=1'],input=sql.encode(),stdout=subprocess.DEVNULL)
    run(COMPOSE+['up','-d','auth-redis','account-redis','message-redis'])
    for service in ['auth','account','message']:run(COMPOSE+['exec','-T',service+'-redis','redis-cli','FLUSHDB'],stdout=subprocess.DEVNULL)
    run(COMPOSE+['up','-d','garage','rabbitmq','auth','account','message','gateway'])
    print('Snapshot restored. Signing/data-protection keys, broker state and S3 objects were restored; caches were cleared.')
if __name__=='__main__':
    if sys.argv[1:]==['backup']:backup()
    elif len(sys.argv)==3 and sys.argv[1]=='restore':restore(sys.argv[2])
    else:sys.exit('Usage: python3 scripts/backup.py backup | restore SNAPSHOT_DIRECTORY')
