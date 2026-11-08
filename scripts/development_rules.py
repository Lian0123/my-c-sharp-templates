#!/usr/bin/env python3
"""Validate feature contracts and enforce repository-specific development boundaries.

SVG m:source remains authoritative. Source scans supplement compilation/tests;
they do not establish behavioral acceptance or replace a C# syntax analyzer.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

if __package__:
    from . import living_docs as docs
else:
    import living_docs as docs

BUSINESS={'Auth':'IAuthService','Account':'IAccountService','Message':'IChatService'}
AUTO={'RULE-ARCH-001','RULE-ARCH-002','RULE-API-001','RULE-TRACE-001'}
REQUIRED_VIEWS={'usecase','activity','state','deployment','sequence','cards'}


def test_reference(ref, base):
    name,_,label=ref.partition('#test:')
    if label:
        path=(base/name).resolve()
        docs.require(base.resolve() in path.parents and path.is_file() and re.search(r'\.(test|spec)\.tsx?$',name),'E_FEATURE','missing frontend test file')
        pattern=r'\b(?:it|test)\(\s*([\'"])'+re.escape(label)+r'\1'
        docs.require(re.search(pattern,path.read_text(encoding='utf-8')),'E_FEATURE','frontend test label no longer exists')
    else:
        docs.require(ref.startswith('tests/'),'E_FEATURE','test references need test code')
        docs.code_reference(ref,base)


def interface_members(base):
    """Supported project contracts: a named public interface with Task methods."""
    result={}
    for service,interface in BUSINESS.items():
        path=f'src/Services/{service}/{service}.Application/Contracts.cs'
        text=(base/path).read_text(encoding='utf-8')
        match=re.search(r'public interface '+interface+r'\s*\{([^}]+)\}',text,re.S)
        docs.require(match,'E_FEATURE','missing business interface: '+interface)
        statements=[v.strip() for v in match.group(1).split(';') if v.strip()]
        methods=[]
        for statement in statements:
            member=re.fullmatch(r'Task(?:<[^;]+>)?\s+(\w+)\s*\([^;]*\)',statement,re.S)
            docs.require(member,'E_FEATURE','unsupported contract syntax; review the member extractor: '+interface)
            methods.append(member.group(1))
        for method in methods:result[path+'#'+interface+'.'+method]=service
    return result


def feature_catalog(models, base):
    engineering=docs.engineering_catalog(models,base)
    requirements={r['id'] for r in engineering['requirements']}
    members=interface_members(base)
    features={};rules={};assigned={}
    for filename,model in sorted(models.items()):
        for node in model.nodes:
            if node.ident.startswith('FEAT-'):
                docs.require(node.ident not in features,'E_FEATURE','duplicate feature ID')
                f=docs.fields(node.fields)
                for key in ['需求','責任服務','角色','目標','輸入','輸出','權限','資料與交易','同步與副作用','失敗與重試','邊界','不做範圍','修改範圍','契約','實作','測試','完成條件','回復方式','實作狀態','驗證狀態']:
                    docs.one(f,key)
                docs.require(all(v in requirements for v in docs.identifiers(docs.one(f,'需求'))),'E_FEATURE','feature links an unknown requirement')
                docs.require(docs.one(f,'實作狀態') in ['implemented','planned'],'E_FEATURE','invalid implementation state')
                docs.require(docs.one(f,'驗證狀態') in ['historical-pass','not-run','partial'],'E_FEATURE','reference existence is not executed acceptance')
                docs.require(all(t in docs.one(f,'完成條件') for t in ['Given','When','Then']),'E_FEATURE','feature needs observable completion')
                for ref in docs.identifiers(docs.one(f,'實作')):docs.code_reference(ref,base)
                for ref in docs.identifiers(docs.one(f,'測試')):test_reference(ref,base)
                for contract in docs.identifiers(docs.one(f,'契約')):
                    if contract=='none':continue
                    docs.require(contract in members,'E_FEATURE','unknown public business operation: '+contract)
                    docs.require(members[contract]==docs.one(f,'責任服務'),'E_FEATURE','feature claims another service contract')
                    docs.require(contract not in assigned,'E_FEATURE','public operation belongs to more than one feature: '+contract)
                    assigned[contract]=node.ident
                features[node.ident]={'id':node.ident,'document':filename,'title':node.title,'fields':f}
            elif node.ident.startswith('RULE-'):
                docs.require(node.ident not in rules,'E_RULE','duplicate rule ID')
                f=docs.fields(node.fields)
                for key in ['規則','理由','檢查方式','適用變更','違反處理','測試']:docs.one(f,key)
                mode=docs.one(f,'檢查方式')
                docs.require(mode in ['automated','review-required'],'E_RULE','rule needs an honest enforcement mode')
                docs.require((node.ident in AUTO)==(mode=='automated'),'E_RULE','automated rules must have registered executable checks')
                for ref in docs.identifiers(docs.one(f,'測試')):docs.code_reference(ref,base)
                rules[node.ident]={'id':node.ident,'document':filename,'fields':f}
    docs.require(features,'E_FEATURE','feature decomposition is required')
    docs.require(set(assigned)==set(members),'E_FEATURE','unmapped public operations: '+','.join(sorted(set(members)-set(assigned))))
    docs.require(AUTO<=set(rules),'E_RULE','required executable rules are missing')
    docs.require(REQUIRED_VIEWS<={m.view for m in models.values()},'E_UML','missing required UML view')
    for model in models.values():
        if model.view=='usecase':
            for node in model.nodes:
                if node.title.startswith('«usecase»'):
                    docs.require(docs.one(docs.fields(node.fields),'功能') in features,'E_UML','use case must link an existing feature contract')
    return {'authority':'Derived from SVG m:source; do not hand edit.','features':list(features.values()),'rules':list(rules.values()),
            'operationOwners':assigned,'coverage':{'features':len(features),'businessOperations':len(members),'mappedOperations':len(assigned),
            'meaning':'Contract mapping completeness only; shared implementation classes remain shared; no current behavioral pass is inferred.'}}


def project_boundaries(base):
    expected={}
    contracts='src/Shared/Contracts/Contracts.csproj';blocks='src/Shared/BuildingBlocks/BuildingBlocks.csproj'
    expected[contracts]=set();expected[blocks]={contracts};expected['src/Gateway/Gateway.csproj']={blocks}
    inner={contracts}
    for name in BUSINESS:
        prefix=f'src/Services/{name}/{name}.'
        paths={layer:prefix+layer+'/'+name+'.'+layer+'.csproj' for layer in ['Domain','Application','Infrastructure','Api']}
        expected[paths['Domain']]={contracts};expected[paths['Application']]={paths['Domain']}
        expected[paths['Infrastructure']]={paths['Application'],blocks}
        expected[paths['Api']]={paths['Infrastructure'],paths['Application']}
        inner.update([paths['Domain'],paths['Application']])
    actual={str(p.relative_to(base)) for p in (base/'src').rglob('*.csproj')}
    docs.require(actual==set(expected),'E_ARCH','project inventory changed; review explicit dependency policy')
    edges=[]
    for name,allowed in expected.items():
        path=base/name;root=ET.parse(path).getroot()
        for reference in root.findall('.//ProjectReference'):
            include=reference.get('Include','').replace('\\','/')
            target=(path.parent/include).resolve()
            docs.require(base.resolve() in target.parents and target.is_file(),'E_ARCH','project reference leaves repository or is missing')
            relative=target.relative_to(base.resolve()).as_posix()
            docs.require(relative in allowed,'E_ARCH','forbidden dependency: '+name+' -> '+relative)
            edges.append([name,relative])
        if name in inner:
            docs.require(not root.findall('.//PackageReference') and not root.findall('.//FrameworkReference'),'E_ARCH','inner layers/contracts cannot add framework or package dependencies')
        for source in path.parent.rglob('*.cs'):
            if any(p in ['bin','obj'] for p in source.relative_to(path.parent).parts):continue
            text=source.read_text(encoding='utf-8')
            imports=re.findall(r'^\s*(?:global\s+)?using\s+(?:static\s+)?(?:\w+\s*=\s*)?([\w.]+)\s*;',text,re.M)
            if name in inner:
                docs.require(not any(v.startswith(('Microsoft.EntityFrameworkCore','Npgsql','StackExchange.Redis','RabbitMQ','Microsoft.AspNetCore','MicroserviceStarter.BuildingBlocks')) or '.Infrastructure' in v or '.Api' in v for v in imports),'E_ARCH','inner source imports an outer infrastructure framework: '+str(source))
            if '/Services/' in name:
                service=name.split('/')[2]
                docs.require(not any(v.startswith('MicroserviceStarter.'+other+'.') for other in BUSINESS if other!=service for v in imports),'E_ARCH','cross-service namespace import: '+str(source))
    return edges


def gateway_boundary(base):
    proxy=json.loads((base/'src/Gateway/appsettings.json').read_text())['ReverseProxy']
    paths={'/api/v1/auth/{**rest}':'auth','/api/v1/accounts/{**rest}':'account','/api/v1/chat/{**rest}':'message','/hubs/chat/{**rest}':'message',
           '/openapi/auth/v1.json':'auth','/openapi/account/v1.json':'account','/openapi/message/v1.json':'message',
           '/assets/{**rest}':'web','/chat/{**rest}':'web','/admin/{**rest}':'web','/auth/{**rest}':'web','/':'web','/favicon.svg':'web'}
    routes=proxy['Routes'];seen=set()
    for route in routes.values():
        path=route['Match']['Path'];cluster=route['ClusterId']
        docs.require(path in paths and paths[path]==cluster and path not in seen,'E_GATEWAY','unexpected public route/cluster; internal endpoints must stay private')
        seen.add(path)
        if path.startswith(('/api/v1/accounts/','/api/v1/chat/','/hubs/')):
            docs.require(route.get('AuthorizationPolicy')=='default','E_GATEWAY','protected route lost JWT policy')
        for transform in route.get('Transforms',[]):
            docs.require(transform=={'PathSet':'/openapi/v1.json'} and path.startswith('/openapi/'),'E_GATEWAY','unexpected path/header transform')
    docs.require(seen==set(paths),'E_GATEWAY','public route inventory changed; review contract and documentation')
    return len(seen)


def check(base=docs.ROOT):
    models={p.name:docs.parse_source(docs.read(p.read_bytes())[2]) for p in sorted((base/'docs/living').glob('*.misvg.svg'))}
    value=feature_catalog(models,base)
    docs.require((base/'docs/living/features.json').read_bytes()==docs.json_bytes(value),'E_FEATURE_INDEX','regenerate features.json from reviewed SVG')
    edges=project_boundaries(base);routes=gateway_boundary(base)
    return {'scope':'Feature/UML contract completeness and static project/gateway boundaries; not behavioral acceptance.',
            'atUtc':datetime.now(timezone.utc).isoformat(),'passed':True,'coverage':value['coverage'],'dependencyEdges':len(edges),'publicRoutes':routes,
            'rules':[{'id':r['id'],'result':'pass' if r['id'] in AUTO else 'review-required; not executed by this static checker'} for r in value['rules']]}


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('command',choices=['check','index','show']);parser.add_argument('--report',type=Path);parser.add_argument('--feature')
    args=parser.parse_args()
    if args.command in ['index','show']:
        models={p.name:docs.parse_source(docs.read(p.read_bytes())[2]) for p in sorted(docs.DIRECTORY.glob('*.misvg.svg'))}
        value=feature_catalog(models,docs.ROOT)
        if args.command=='show':
            selected=[f for f in value['features'] if f['id']==args.feature]
            docs.require(len(selected)==1,'E_FEATURE','choose an existing --feature ID');value=selected[0]
        else:
            target=docs.DIRECTORY/'features.json'
            with docs.locked(target):docs.atomic_write(target,docs.json_bytes(value),docs.digest(target.read_bytes()) if target.exists() else None)
    else:value=check()
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_bytes(docs.json_bytes(value))
    print(json.dumps(value,ensure_ascii=False,indent=2));return 0


if __name__=='__main__':
    try:sys.exit(main())
    except (docs.DocumentError,OSError,ValueError,KeyError) as error:print(str(error),file=sys.stderr);sys.exit(1)
