#!/usr/bin/env python3
import sys,time,urllib.request
url=sys.argv[1]
deadline=time.monotonic()+float(sys.argv[2] if len(sys.argv)>2 else 180)
while time.monotonic()<deadline:
    try:
        with urllib.request.urlopen(url,timeout=3) as response:
            if response.status==200: print('Ready:',url);sys.exit(0)
    except Exception: pass
    time.sleep(1)
sys.exit('Timed out waiting for '+url)
