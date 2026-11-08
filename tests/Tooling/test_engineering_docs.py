"""Independent expectations for lifecycle, traceability and append-only evidence."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location('engineering_docs_test',ROOT/'scripts/living_docs.py')
M=importlib.util.module_from_spec(SPEC);sys.modules[SPEC.name]=M;SPEC.loader.exec_module(M)


class EngineeringDocumentTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.base=Path(self.temp.name)
        (self.base/'src').mkdir();(self.base/'tests').mkdir()
        (self.base/'src/Apply.cs').write_text('public class Handler { public void Apply() {} }')
        (self.base/'tests/Rules.cs').write_text('public class Tests { public void RejectDuplicate() {} }')
        intro=['文件編號：DOC-TEST','文件狀態：current','核准狀態：not-recorded','維護角色：技術角色（待具名）','具名負責人：unassigned','適用基準：referenced-source-sha256','最後審查：2026-11-08','關聯需求：REQ-TEST-001','關聯決策：ADR-TEST-001']
        self.model=M.Model(title='測試工程契約',intro=list(enumerate(intro,1)))
        def node(ident,values):return M.Node(ident,ident,1,1,list(enumerate(values,1)))
        self.requirement=node('REQ-TEST-001',['需求狀態：confirmed','需求依據：使用者明確需求','風險：high','目標：防止重複提交','驗收：AC-001 Given 相同識別碼 When 重送 Then 只有一份資料','預期依據：已約定的冪等語意','決策：ADR-TEST-001','圖頁：test.svg','實作：src/Apply.cs#Apply','測試：tests/Rules.cs#RejectDuplicate','驗證命令：dotnet test','驗證狀態：not-run','證據：REC-PLANNED'])
        self.decision=node('ADR-TEST-001',['決策狀態：observed-retrospective','問題：重複請求','採用方案：唯一鍵','替代方案：尚未實測','理由與代價：資料一致性與衝突處理','重評條件：契約變更','紀錄性質：補記，非歷史會議紀錄'])
        self.model.nodes=[node('PHASE-0'+str(i),['輸入：已知資料','產出：有界成果','完成條件：可觀察結果','責任角色：待具名']) for i in range(1,7)]+[self.requirement,self.decision]

    def catalog(self):return M.engineering_catalog({'test.svg':self.model},self.base)

    def remove(self,node,key):node.fields=[v for v in node.fields if not v[1].startswith(key+'：')]

    def change(self,node,key,value):
        self.remove(node,key);node.fields.append((1,key+'：'+value))

    def assert_invalid(self,code='E_GOVERNANCE'):
        with self.assertRaises(M.DocumentError) as error:self.catalog()
        self.assertEqual(error.exception.code,code)

    def test_reference_coverage_does_not_claim_executed_acceptance(self):
        report=self.catalog();self.assertEqual(report['coverage']['withAcceptanceAndTestReferences'],1)
        self.assertIn('not proof',report['coverage']['meaning'])
        self.assertEqual(report['requirements'][0]['fields']['驗證狀態'],['not-run'])

    def test_missing_acceptance_fails(self):
        self.remove(self.requirement,'驗收');self.assert_invalid()

    def test_test_percentage_is_not_an_observable_acceptance_condition(self):
        self.change(self.requirement,'驗收','AC-001 測試覆蓋率達 100%');self.assert_invalid('E_TRACE')

    def test_missing_stage_or_stage_exit_blocks_delivery_control(self):
        original=copy.deepcopy(self.model.nodes)
        with self.subTest('missing stage'):
            self.model.nodes.pop(0);self.assert_invalid()
        self.model.nodes=original
        with self.subTest('missing stage exit'):
            self.remove(self.model.nodes[0],'完成條件');self.assert_invalid()

    def test_missing_named_owner_is_not_silently_fabricated(self):
        self.model.intro=[x for x in self.model.intro if not x[1].startswith('具名負責人：')];self.assert_invalid()

    def test_confirmation_without_attributable_evidence_is_rejected(self):
        self.model.intro=[(n,v.replace('核准狀態：not-recorded','核准狀態：confirmed')) for n,v in self.model.intro];self.assert_invalid()

    def test_invalid_lifecycle_or_review_date_is_rejected(self):
        original=self.model.intro[:]
        for before,after in [('最後審查：2026-11-08','最後審查：tomorrow'),('文件狀態：current','文件狀態：approved-by-ai')]:
            with self.subTest(after):
                self.model.intro=[(n,v.replace(before,after)) for n,v in original];self.assert_invalid()

    def test_dangling_decision_and_diagram_are_rejected(self):
        with self.subTest('decision'):
            self.change(self.requirement,'決策','ADR-MISSING');self.assert_invalid('E_TRACE')
        self.change(self.requirement,'決策','ADR-TEST-001')
        with self.subTest('diagram'):
            self.change(self.requirement,'圖頁','missing.svg');self.assert_invalid('E_TRACE')

    def test_reverse_diagram_requirement_link_is_required(self):
        other=copy.deepcopy(self.model);other.intro=[(n,v.replace('文件編號：DOC-TEST','文件編號：DOC-OTHER').replace('關聯需求：REQ-TEST-001','關聯需求：REQ-OTHER-001')) for n,v in other.intro]
        other.nodes=[copy.deepcopy(self.requirement)];other.nodes[0].ident='REQ-OTHER-001'
        self.change(other.nodes[0],'圖頁','other.svg')
        self.change(self.requirement,'圖頁','test.svg,other.svg')
        with self.assertRaises(M.DocumentError) as error:M.engineering_catalog({'test.svg':self.model,'other.svg':other},self.base)
        self.assertEqual(error.exception.code,'E_TRACE')

    def test_missing_test_declaration_is_rejected(self):
        self.change(self.requirement,'測試','tests/Rules.cs#Missing');self.assert_invalid('E_TRACE')

    def test_implementation_is_not_a_substitute_for_a_test_reference(self):
        self.change(self.requirement,'測試','src/Apply.cs#Apply');self.assert_invalid('E_TRACE')

    def test_reference_existence_cannot_be_labeled_current_pass(self):
        self.change(self.requirement,'驗證狀態','current-pass');self.assert_invalid()

    def test_historical_decision_requires_tradeoff_and_revisit_trigger(self):
        self.remove(self.decision,'重評條件');self.assert_invalid()

    def test_catalog_is_a_deterministic_derived_index(self):
        self.assertEqual(M.json_bytes(self.catalog()),M.json_bytes(self.catalog()))


class ArchiveTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.base=Path(self.temp.name)
        self.evidence=self.base/'test-output.txt';self.evidence.write_text('one test passed\n')
        self.target=self.base/'docs/records/REC-TEST-001'
        self.record={'recordId':'REC-TEST-001','kind':'verification','scope':'documentation only','applicability':{'sourceSnapshot':'fixture'},'checks':[
            {'command':'unit-test','status':'pass','exitCode':0,'evidence':'evidence/unit.txt','reason':'documentation unit checks'},
            {'command':'application-integration','status':'not-run','exitCode':None,'reason':'outside this documentation-only change'}],'corrects':[]}

    def create(self):M.archive_record(self.target,self.record,{'unit.txt':self.evidence},self.base)

    def git(self,*args):
        subprocess.run(['git','-C',str(self.base),*args],check=True,capture_output=True)

    def commit(self):
        self.git('add','.')
        self.git('-c','user.name=Documentation Test','-c','user.email=docs@example.test','commit','-qm','archive fixture')

    def test_archive_preserves_scope_and_not_run_results(self):
        self.create();result=M.verify_record(self.target,self.base,history=False)
        self.assertEqual(result['integrity'],'pass');self.assertEqual(result['history'],'not-checked')
        self.assertEqual(json.loads((self.target/'record.json').read_text())['checks'][1]['status'],'not-run')

    def test_existing_archive_is_not_overwritten(self):
        self.create();original=(self.target/'record.json').read_bytes()
        with self.assertRaises(M.DocumentError) as error:self.create()
        self.assertEqual(error.exception.code,'E_RECORD_IMMUTABLE');self.assertEqual((self.target/'record.json').read_bytes(),original)

    def test_changed_evidence_is_detected(self):
        self.create();(self.target/'evidence/unit.txt').write_text('altered')
        with self.assertRaises(M.DocumentError):M.verify_record(self.target,self.base,history=False)

    def test_pass_without_retained_evidence_does_not_publish_an_archive(self):
        self.record['checks'][0]['evidence']='evidence/missing.txt'
        with self.assertRaises(M.DocumentError):self.create()
        self.assertFalse(self.target.exists())

    def test_not_run_with_an_exit_code_is_rejected(self):
        self.record['checks'][1]['exitCode']=0
        with self.assertRaises(M.DocumentError):self.create()

    def test_correction_must_link_an_existing_other_record(self):
        self.record['corrects']=['REC-MISSING']
        with self.assertRaises(M.DocumentError):self.create()

    def test_git_history_detects_resealed_record_mutation(self):
        self.git('init','-q');self.create();self.commit()
        self.assertEqual(M.verify_record(self.target,self.base)['history'],'unchanged-since-first-commit')
        (self.target/'evidence/unit.txt').write_text('rewritten')
        manifest=next(self.target.glob('manifest.*.json'));manifest.unlink()
        values={str(p.relative_to(self.target)):M.digest(p.read_bytes()) for p in self.target.rglob('*') if p.is_file()}
        raw=M.json_bytes({'schemaVersion':1,'recordId':self.target.name,'files':values})
        (self.target/('manifest.'+M.digest(raw)+'.json')).write_bytes(raw)
        with self.assertRaises(M.DocumentError) as error:M.verify_record(self.target,self.base)
        self.assertEqual(error.exception.code,'E_RECORD_IMMUTABLE')

    def test_git_history_detects_deleting_a_whole_archive(self):
        self.git('init','-q');self.create();self.commit();shutil.rmtree(self.target)
        with self.assertRaises(M.DocumentError) as error:M.check_records(self.base)
        self.assertEqual(error.exception.code,'E_RECORD_IMMUTABLE')


if __name__=='__main__':unittest.main()
