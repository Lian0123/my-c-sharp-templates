#!/usr/bin/env python3
"""Fail closed when either application coverage report is missing or below the agreed gate."""
from pathlib import Path
import hashlib, json, sys, xml.etree.ElementTree as ET

# VSTest may copy the same collector attachment into the TRX deployment folder.
# Accept byte-identical copies; distinct reports still fail instead of masking stale runs.
backend=list({hashlib.sha256(path.read_bytes()).digest():path
              for path in Path('artifacts/backend').rglob('coverage.cobertura.xml')}.values())
frontend=Path('src/Web/coverage/coverage-summary.json')
if len(backend)!=1 or not frontend.exists():
    sys.exit('Expected exactly one merged backend report and one frontend report; run scripts/test.sh.')
root=ET.parse(backend[0]).getroot()
web=json.loads(frontend.read_text())['total']
results={'backend':(float(root.attrib['line-rate'])*100,float(root.attrib['branch-rate'])*100),
         'frontend':(web['lines']['pct'],web['branches']['pct'])}
failed=False
for name,(lines,branches) in results.items():
    print(f'{name}: lines={lines:.2f}% (>=95%), branches={branches:.2f}% (>=90%)')
    failed |= lines<95 or branches<90
sys.exit(1 if failed else 0)
