"""MISVG project workflow: format, fidelity, Unicode, unsafe input and edit safety."""
import copy
import importlib.util
from pathlib import Path
import re
import sys
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('relay_living_docs_tests', ROOT/'scripts/living_docs.py')
M = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = M
SPEC.loader.exec_module(M)
SOURCE = '# 測試架構\n\n視圖：cards\n範圍：保留 Unicode 與關係。\n\n## 節點\n\n### sender | 發送者\n\n- 描述：來源資料\n\n### receiver | 收件者\n\n- 描述：目的資料\n\n## 關係\n\n- event | sender | receiver | 版本化事件\n\n## 準則\n\n- 不跨服務查資料庫。\n\n## 來源\n\n- README.md\n'
DOC_ID = 'urn:uuid:5e531280-e0eb-4eaa-8510-c6146c19c719'


class LivingDocumentTests(unittest.TestCase):
    def setUp(self):
        self.raw = M.document(SOURCE, DOC_ID, 1, M.provenance(M.parse_source(SOURCE)))
        self.root = ET.fromstring(self.raw)

    def mutate(self, fn):
        root = copy.deepcopy(self.root)
        fn(root)
        return ET.tostring(root, encoding='utf-8')

    def assert_error(self, code, raw, checker=M.read):
        with self.assertRaises(M.DocumentError) as error:
            checker(raw)
        self.assertEqual(error.exception.code, code)

    def test_valid_source_binding_and_generated_fidelity(self):
        self.assertEqual(M.read(self.raw)[2], SOURCE)
        result = M.check(self.raw)
        self.assertTrue(all(v == 'pass' for k,v in result.items() if k != 'visual-review'))
        self.assertEqual(result['visual-review'], 'not-checked')

    def test_namespace_prefix_is_not_identity(self):
        raw = self.raw.replace(b'xmlns:m=',b'xmlns:doc=').replace(b'<m:',b'<doc:').replace(b'</m:',b'</doc:')
        self.assertEqual(M.read(raw)[2], SOURCE)

    def test_xml_escape_and_split_cdata_round_trip(self):
        source = SOURCE.replace('保留 Unicode 與關係。','<& ]]> 原始文字。')
        raw = M.document(source,DOC_ID,1,M.provenance(M.parse_source(source)))
        cdata = '<![CDATA['+source.replace(']]>',']]]]><![CDATA[>')+']]>'
        raw = re.sub(rb'(<m:source[^>]*>).*?(</m:source>)',lambda match:match[1]+cdata.encode()+match[2],raw,flags=re.S)
        self.assertEqual(M.read(raw)[2], source)

    def test_file_bom_is_accepted_and_source_bom_is_preserved(self):
        self.assertEqual(M.read(b'\xef\xbb\xbf'+self.raw)[2], SOURCE)
        source = SOURCE.replace('保留','\ufeff保留')
        raw = M.document(source,DOC_ID,1,M.provenance(M.parse_source(source)))
        self.assertEqual(M.read(raw)[2], source)

    def test_declaration_looking_cdata_is_inert_source_text(self):
        source=SOURCE.replace('保留 Unicode 與關係。','<!DOCTYPE example> <?inert data?>')
        raw=M.document(source,DOC_ID,1,M.provenance(M.parse_source(source)))
        raw=re.sub(rb'(<m:source[^>]*>).*?(</m:source>)',lambda match:match[1]+b'<![CDATA['+source.encode()+b']]>'+match[2],raw,flags=re.S)
        self.assertEqual(M.read(raw)[2],source)

    def test_physical_crlf_normalization(self):
        self.assertEqual(M.read(self.raw.replace(b'\n',b'\r\n'))[2], SOURCE)

    def test_source_characters_are_not_normalized_or_trimmed(self):
        for text in ['é','e\u0301']:
            source = SOURCE.replace('Unicode',text).rstrip('\n')
            raw = M.document(source,DOC_ID,1,M.provenance(M.parse_source(source)))
            self.assertEqual(M.read(raw)[2], source)
        self.assertNotEqual(M.digest('é'.encode()), M.digest('e\u0301'.encode()))
        self.assertNotEqual(M.digest(b'abc'), M.digest(b'abc\n'))

    def test_digest_vectors_and_line_boundaries(self):
        self.assertEqual(M.digest(b'abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
        self.assertEqual(M.digest(b''),'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
        self.assertEqual([M.line_count(x) for x in ['', 'a', 'a\n', 'a\n\n', '\n']], [0,1,1,2,1])

    def test_empty_source_can_be_read_without_bindings(self):
        def mutate(root):
            doc=root[2][0];doc[0].text='';doc[1].set('source-digest','sha256:'+M.digest(b''));doc.remove(doc.find('{'+M.MISVG+'}bindings'))
        self.assertEqual(M.read(self.mutate(mutate))[2], '')

    def test_source_mismatch_is_rejected(self):
        self.assert_error('E_DIGEST_MISMATCH',self.mutate(lambda r:setattr(r[2][0][0],'text','changed')))

    def test_entity_encoded_cr_is_rejected(self):
        self.assert_error('E_SOURCE',self.raw.replace('Unicode'.encode(),b'Unicode&#13;'))

    def test_source_children_and_comments_are_rejected(self):
        for child in [ET.Element('child'), ET.Comment('comment')]:
            self.assert_error('E_SOURCE',self.mutate(lambda r:r[2][0][0].append(child)))

    def test_duplicate_source_and_unknown_core_vocabulary_are_rejected(self):
        self.assert_error('E_STRUCTURE',self.mutate(lambda r:r[2][0].insert(1,copy.deepcopy(r[2][0][0]))))
        self.assert_error('E_STRUCTURE',self.mutate(lambda r:r[2][0].set('typo','x')))

    def test_versions_profile_and_dialect_are_explicit(self):
        for field,value in [('version','0.2'),('profile','html')]:
            self.assert_error('E_UNSUPPORTED',self.mutate(lambda r:r[2][0].set(field,value)))
        self.assert_error('E_UNSUPPORTED',self.mutate(lambda r:r[2][0][0].set('dialect','gfm')))

    def test_revision_and_document_uuid_are_constrained(self):
        for value in ['0','01',str(M.MAX_REVISION+1)]:
            self.assert_error('E_STRUCTURE',self.mutate(lambda r:r[2][0].set('revision',value)))
        self.assert_error('E_STRUCTURE',self.mutate(lambda r:r[2][0].set('doc-id','urn:uuid:00000000-0000-1000-8000-000000000000')))

    def test_forbidden_declarations_and_invalid_encoding_are_rejected(self):
        for prefix in [b'<!DOCTYPE svg [<!ENTITY ex SYSTEM "file:///no-read">]>',b'<?process external?>']:
            self.assert_error('E_XML',prefix+ET.tostring(self.root))
        self.assert_error('E_XML',b'\xff'+self.raw)

    def test_active_elements_and_event_attributes_never_reach_rendering(self):
        for tag in ['script','foreignObject','image','a','style','defs']:
            self.assert_error('E_PROFILE',self.mutate(lambda r:r[-1].append(ET.Element('{'+M.SVG+'}'+tag))))
        for name in ['onclick','href','style']:
            self.assert_error('E_PROFILE',self.mutate(lambda r:r[-1].set(name,'javascript:alert(1)')))

    def test_unsupported_valid_geometry_is_reported_as_unsupported(self):
        self.assert_error('E_UNSUPPORTED',self.mutate(lambda r:r[-1].append(ET.Element('{'+M.SVG+'}path',{'d':'M 0 0 L 1 1'}))))

    def test_invalid_geometry_and_paints_are_rejected(self):
        for name,value in [('width','-1'),('x','NaN'),('fill','url(https://example.invalid/x)')]:
            self.assert_error('E_PROFILE',self.mutate(lambda r:r[-1][0].set(name,value)))
        self.assert_error('E_PROFILE',self.mutate(lambda r:r[-1].set('font-family','unsafe(url), sans-serif')))

    def test_canvas_and_resource_limits_are_checked(self):
        self.assert_error('E_PROFILE',self.mutate(lambda r:r.set('width','16385')))
        self.assert_error('E_LIMIT',b'x'*(M.MAX_FILE+1))
        with patch.object(M,'MAX_DEPTH',2):self.assert_error('E_LIMIT',self.raw)
        with patch.object(M,'MAX_NODES',2):self.assert_error('E_LIMIT',self.raw)

    def test_duplicate_ids_and_root_reference_are_rejected(self):
        self.assert_error('E_REFERENCE',self.mutate(lambda r:r[-1][0].set('id','view')))
        self.assert_error('E_REFERENCE',self.mutate(lambda r:r[2][0][1].set('root-ref','missing')))

    def test_invalid_bindings_are_rejected(self):
        for name,value in [('target','missing'),('end-line','999999'),('start-line','0')]:
            self.assert_error('E_REFERENCE',self.mutate(lambda r:r[2][0].find('{'+M.MISVG+'}bindings')[0].set(name,value)))

    def test_view_tampering_is_not_hidden_by_a_matching_source_digest(self):
        def mutate(root):
            element=root[-1].find('.//{'+M.SVG+'}tspan');element.text='altered content'
        self.assert_error('E_CONTENT',self.mutate(mutate),M.check)

    def test_unknown_relationship_target_is_rejected(self):
        with self.assertRaises(M.DocumentError):M.parse_source(SOURCE.replace(' | receiver | ',' | missing | '))

    def test_unresolved_merge_is_not_saved_as_a_completed_document(self):
        with self.assertRaises(M.DocumentError) as error:M.parse_source(SOURCE.replace('範圍：','<<<<<<< HEAD\n範圍：'))
        self.assertEqual(error.exception.code,'E_CONFLICT')

    def test_secret_files_are_not_published_as_code_references(self):
        model=M.parse_source(SOURCE.replace('- README.md','- .env'))
        with self.assertRaises(M.DocumentError) as error:M.provenance(model)
        self.assertEqual(error.exception.code,'E_REFERENCE')

    def test_text_between_core_elements_is_not_silently_ignored(self):
        self.assert_error('E_STRUCTURE',self.mutate(lambda r:setattr(r[2][0][0],'tail','unexpected text')))

    def test_changed_code_requires_an_explicit_review(self):
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory);(base/'README.md').write_text('different code')
            with self.assertRaises(M.DocumentError) as error:M.check(self.raw,base)
            self.assertEqual(error.exception.code,'E_SOURCE_STALE')

    def test_edit_preserves_identity_increments_revision_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'living.svg';path.write_bytes(self.raw)
            source=SOURCE.replace('來源資料','修改來源')
            self.assertTrue(M.save(path,source,M.digest(self.raw)))
            _,doc,value=M.read(path.read_bytes())
            self.assertEqual(doc.get('doc-id'),DOC_ID);self.assertEqual(doc.get('revision'),'2');self.assertEqual(value,source)
            self.assertFalse(M.save(path,source,M.digest(path.read_bytes())))

    def test_conflicting_edit_keeps_the_newer_original(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'living.svg';path.write_bytes(b'concurrent edit')
            with M.locked(path):
                with self.assertRaises(M.DocumentError) as error:M.atomic_write(path,b'candidate',M.digest(self.raw))
            self.assertEqual(error.exception.code,'E_CONFLICT');self.assertEqual(path.read_bytes(),b'concurrent edit')

    def test_failed_atomic_replace_keeps_the_original(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'living.svg';path.write_bytes(self.raw)
            with M.locked(path),patch.object(M.os,'replace',side_effect=OSError('simulated failure')):
                with self.assertRaises(OSError):M.atomic_write(path,b'candidate',M.digest(self.raw))
            self.assertEqual(path.read_bytes(),self.raw);self.assertEqual(list(path.parent.iterdir()),[path])

    def test_unknown_extension_is_readable_but_not_silently_edited(self):
        raw=self.mutate(lambda r:r[2][0].find('{'+M.MISVG+'}extensions').append(ET.Element('{urn:unknown}data',{'value':'preserve me'})))
        self.assertEqual(M.read(raw)[2],SOURCE)
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'living.svg';path.write_bytes(raw)
            with self.assertRaises(M.DocumentError) as error:M.save(path,SOURCE,M.digest(raw))
            self.assertEqual(error.exception.code,'E_EXTENSION_EDIT');self.assertEqual(path.read_bytes(),raw)


if __name__ == '__main__':
    unittest.main()
