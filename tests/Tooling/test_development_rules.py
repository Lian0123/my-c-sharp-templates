"""Failure-oriented checks for feature ownership, UML and real project boundaries."""
import copy
from pathlib import Path
import shutil
import tempfile
import unittest
from scripts import development_rules as rules

ROOT=Path(__file__).resolve().parents[2]


class DevelopmentRulesTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.base=Path(self.temp.name)
        for name in ['src','scripts','tests','docs/living']:
            shutil.copytree(ROOT/name,self.base/name,ignore=shutil.ignore_patterns('node_modules','obj','bin','coverage','test-results'))
        self.models={p.name:rules.docs.parse_source(rules.docs.read(p.read_bytes())[2]) for p in (self.base/'docs/living').glob('*.misvg.svg')}

    def feature(self):
        return next(n for m in self.models.values() for n in m.nodes if n.ident.startswith('FEAT-'))

    def change(self,node,key,value):
        node.fields=[x for x in node.fields if not x[1].startswith(key+'：')]+[(1,key+'：'+value)]

    def rejected(self,call,code):
        with self.assertRaises(rules.docs.DocumentError) as error:call()
        self.assertEqual(error.exception.code,code)

    def test_repository_project_graph_and_gateway_are_allowed(self):
        self.assertGreater(len(rules.project_boundaries(self.base)),10)
        self.assertEqual(rules.gateway_boundary(self.base),13)

    def test_all_business_operations_have_one_feature_owner(self):
        value=rules.feature_catalog(self.models,self.base)
        self.assertEqual(value['coverage']['businessOperations'],25)
        self.assertEqual(value['coverage']['mappedOperations'],25)
        self.assertIn('no current behavioral pass',value['coverage']['meaning'])

    def test_unmapped_new_interface_operation_fails(self):
        p=self.base/'src/Services/Auth/Auth.Application/Contracts.cs'
        p.write_text(p.read_text().replace('public interface IAuthService\n{','public interface IAuthService\n{\n    Task NewOperation(CancellationToken ct);'))
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_FEATURE')

    def test_duplicate_feature_operation_ownership_fails(self):
        node=copy.deepcopy(self.feature());node.ident='FEAT-DUPLICATE'
        next(iter(self.models.values())).nodes.append(node)
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_FEATURE')

    def test_feature_requires_bounds_failure_handling_and_rollback(self):
        node=self.feature();original=node.fields[:]
        for key in ['邊界','失敗與重試','修改範圍','回復方式']:
            with self.subTest(key):
                node.fields=[x for x in original if not x[1].startswith(key+'：')]
                self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_GOVERNANCE')
        node.fields=original

    def test_feature_cannot_claim_current_pass_from_references(self):
        self.change(self.feature(),'驗證狀態','current-pass')
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_FEATURE')

    def test_feature_cannot_own_a_different_service_operation(self):
        self.change(self.feature(),'責任服務','SomeoneElse')
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_FEATURE')

    def test_renamed_frontend_test_is_detected(self):
        self.rejected(lambda:rules.test_reference('src/Web/src/AuthPage.test.tsx#test:missing scenario',self.base),'E_FEATURE')
        rules.test_reference('src/Web/src/AuthPage.test.tsx#test:logs in with validated form inputs',self.base)

    def test_missing_uml_view_is_not_silently_accepted(self):
        for model in self.models.values():
            if model.view=='state':model.view='cards'
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_UML')

    def test_use_case_cannot_reference_a_missing_feature(self):
        node=next(n for m in self.models.values() if m.view=='usecase' for n in m.nodes if n.title.startswith('«usecase»'))
        self.change(node,'功能','FEAT-MISSING')
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_UML')

    def test_unimplemented_automatic_rule_is_rejected(self):
        node=next(n for m in self.models.values() for n in m.nodes if n.ident=='RULE-AUTH-001')
        self.change(node,'檢查方式','automated')
        self.rejected(lambda:rules.feature_catalog(self.models,self.base),'E_RULE')

    def test_cross_service_and_reversed_layer_project_references_fail(self):
        p=self.base/'src/Services/Message/Message.Application/Message.Application.csproj';original=p.read_text()
        for include in ['../../Auth/Auth.Domain/Auth.Domain.csproj','../Message.Infrastructure/Message.Infrastructure.csproj']:
            with self.subTest(include):
                p.write_text(original.replace('</Project>','<ItemGroup><ProjectReference Include="'+include+'" /></ItemGroup></Project>'))
                self.rejected(lambda:rules.project_boundaries(self.base),'E_ARCH')

    def test_nested_domain_framework_import_and_package_fail(self):
        folder=self.base/'src/Services/Auth/Auth.Domain/Nested';folder.mkdir()
        p=folder/'Leak.cs';p.write_text('using Microsoft.EntityFrameworkCore;\npublic class Leak {}')
        self.rejected(lambda:rules.project_boundaries(self.base),'E_ARCH');p.unlink()
        project=folder.parent/'Auth.Domain.csproj'
        project.write_text(project.read_text().replace('</Project>','<ItemGroup><PackageReference Include="Npgsql" /></ItemGroup></Project>'))
        self.rejected(lambda:rules.project_boundaries(self.base),'E_ARCH')

    def test_shared_contracts_cannot_reference_a_business_project(self):
        import xml.etree.ElementTree as ET
        p=self.base/'src/Shared/Contracts/Contracts.csproj'
        tree=ET.parse(p);group=ET.SubElement(tree.getroot(),'ItemGroup')
        ET.SubElement(group,'ProjectReference',{'Include':'../../Services/Auth/Auth.Domain/Auth.Domain.csproj'});tree.write(p)
        self.rejected(lambda:rules.project_boundaries(self.base),'E_ARCH')

    def test_gateway_internal_proxy_and_lost_jwt_policy_fail(self):
        import json
        p=self.base/'src/Gateway/appsettings.json';original=json.loads(p.read_text())
        value=copy.deepcopy(original);value['ReverseProxy']['Routes']['internal']={'ClusterId':'auth','Match':{'Path':'/internal/{**rest}'}}
        p.write_text(json.dumps(value));self.rejected(lambda:rules.gateway_boundary(self.base),'E_GATEWAY')
        value=copy.deepcopy(original);del value['ReverseProxy']['Routes']['hub']['AuthorizationPolicy']
        p.write_text(json.dumps(value));self.rejected(lambda:rules.gateway_boundary(self.base),'E_GATEWAY')

    def test_gateway_path_transform_cannot_publish_internal_endpoint(self):
        import json
        p=self.base/'src/Gateway/appsettings.json';value=json.loads(p.read_text())
        value['ReverseProxy']['Routes']['auth']['Transforms']=[{'PathSet':'/internal/sessions/check'}]
        p.write_text(json.dumps(value));self.rejected(lambda:rules.gateway_boundary(self.base),'E_GATEWAY')

    def test_changed_feature_index_fails(self):
        p=self.base/'docs/living/features.json';p.write_text('{}')
        self.rejected(lambda:rules.check(self.base),'E_FEATURE_INDEX')


class UmlViewTests(unittest.TestCase):
    def model(self,name):
        path=next((ROOT/'docs/living').glob(name+'-*.misvg.svg'))
        return rules.docs.parse_source(rules.docs.read(path.read_bytes())[2])

    def test_native_use_case_actor_and_deployment_shapes_exist(self):
        d=rules.docs
        canvas,_=d.render(self.model('13'))
        self.assertEqual(len(canvas.view.findall('.//{'+d.SVG+'}ellipse')),8)
        self.assertEqual(len(canvas.view.findall('.//{'+d.SVG+'}circle')),3)
        deployment,_=d.render(self.model('16'))
        for node in self.model('16').nodes:
            group=deployment.view.find('{'+d.SVG+'}g[@id="node-'+node.ident+'"]')
            self.assertIsNotNone(group.find('{'+d.SVG+'}polyline'))

    def test_activity_and_state_retain_direction_and_source_bindings(self):
        d=rules.docs
        for name in ['14','15']:
            with self.subTest(name):
                model=self.model(name);canvas,height=d.render(model)
                targets={a for a,_,_ in canvas.bindings}
                self.assertTrue({'node-'+n.ident for n in model.nodes}<=targets)
                self.assertTrue({'edge-'+str(i) for i in range(1,len(model.edges)+1)}<=targets)
                self.assertLess(height*d.WIDTH,16777216)

    def test_activity_decision_without_guards_fails(self):
        model=self.model('14')
        edge=next(e for e in model.edges if e.source=='accepted');edge.label='unconditional'
        with self.assertRaises(rules.docs.DocumentError):rules.docs.render(model)

    def test_branch_and_retry_numbers_do_not_share_a_label_position(self):
        d=rules.docs;canvas,_=d.render(self.model('15'));positions=[]
        for group in canvas.view.findall('{'+d.SVG+'}g'):
            if not group.get('id','').startswith('uml-link-'):continue
            for text in group.findall('{'+d.SVG+'}text'):
                x,y=float(text.get('x')),float(text.get('y'))
                self.assertFalse(any(abs(x-a)<24 and abs(y-b)<24 for a,b in positions))
                positions.append((x,y))

    def test_state_view_cannot_silently_render_a_decision_as_a_state(self):
        model=self.model('15');model.nodes[1].title='«decision» wrong node'
        with self.assertRaises(rules.docs.DocumentError):rules.docs.render(model)

    def test_special_node_fields_cannot_disappear_from_the_picture(self):
        model=self.model('14');model.nodes[0].fields=[(1,'must remain visible')]
        with self.assertRaises(rules.docs.DocumentError):rules.docs.render(model)

    def test_use_case_requires_actor_to_case_associations(self):
        model=self.model('13');model.edges[0].target='member'
        with self.assertRaises(rules.docs.DocumentError):rules.docs.render(model)

    def test_native_ellipse_tampering_fails_content_fidelity(self):
        import xml.etree.ElementTree as ET
        import uuid
        d=rules.docs;path=next((ROOT/'docs/living').glob('13-*.misvg.svg'))
        source=d.read(path.read_bytes())[2];model=d.parse_source(source)
        raw=d.document(source,'urn:uuid:'+str(uuid.uuid4()),1,d.provenance(model))
        self.assertEqual(d.check(raw)['content-fidelity'],'pass')
        root=ET.fromstring(raw);root.find('.//{'+d.SVG+'}ellipse').set('rx','190')
        with self.assertRaises(d.DocumentError) as error:d.check(ET.tostring(root))
        self.assertEqual(error.exception.code,'E_CONTENT')


if __name__=='__main__':unittest.main()
