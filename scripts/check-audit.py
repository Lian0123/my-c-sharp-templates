#!/usr/bin/env python3
import json,sys
from pathlib import Path
data=json.loads(Path('artifacts/dependency-audit.json').read_text())
issues=[]
for project in data.get('projects',[]):
    for framework in project.get('frameworks',[]):
        for key in ['topLevelPackages','transitivePackages']:
            for package in framework.get(key,[]):
                for advisory in package.get('vulnerabilities',[]):issues.append((package['id'],advisory.get('severity','Unknown')))
if issues:
    for package,severity in sorted(set(issues)):print(package,severity)
    sys.exit(1)
print('No known vulnerable NuGet packages.')
