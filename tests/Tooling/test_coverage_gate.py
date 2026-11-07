"""Regression checks for CI coverage artifacts and the agreed quality thresholds."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


CHECKER = Path(__file__).resolve().parents[2] / 'scripts' / 'check-coverage.py'


class CoverageGateTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.backend = self.root / 'artifacts/backend/collector/coverage.cobertura.xml'
        self.frontend = self.root / 'src/Web/coverage/coverage-summary.json'
        self.backend.parent.mkdir(parents=True)
        self.frontend.parent.mkdir(parents=True)
        self.reports()

    def reports(self, backend_lines=.95, backend_branches=.90, frontend_lines=95, frontend_branches=90):
        self.backend.write_text(f'<coverage line-rate="{backend_lines}" branch-rate="{backend_branches}"/>')
        self.frontend.write_text(json.dumps({'total': {'lines': {'pct': frontend_lines}, 'branches': {'pct': frontend_branches}}}))

    def check(self):
        return subprocess.run([sys.executable, str(CHECKER)], cwd=self.root, capture_output=True, text=True)

    def test_accepts_exact_thresholds(self):
        self.assertEqual(self.check().returncode, 0)

    def test_accepts_identical_trx_attachment_copy(self):
        copied = self.root / 'artifacts/backend/runner/In/runner/coverage.cobertura.xml'
        copied.parent.mkdir(parents=True)
        copied.write_bytes(self.backend.read_bytes())
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_rejects_different_reports_instead_of_choosing_a_passing_one(self):
        stale = self.root / 'artifacts/backend/stale/coverage.cobertura.xml'
        stale.parent.mkdir(parents=True)
        stale.write_text('<coverage line-rate="1" branch-rate="1"/>')
        self.assertNotEqual(self.check().returncode, 0)

    def test_requires_backend_report(self):
        self.backend.unlink()
        self.assertNotEqual(self.check().returncode, 0)

    def test_requires_frontend_report(self):
        self.frontend.unlink()
        self.assertNotEqual(self.check().returncode, 0)

    def test_rejects_each_below_threshold_measurement(self):
        for values in [(.9499, .90, 95, 90), (.95, .8999, 95, 90), (.95, .90, 94.99, 90), (.95, .90, 95, 89.99)]:
            with self.subTest(values=values):
                self.reports(*values)
                self.assertNotEqual(self.check().returncode, 0)


if __name__ == '__main__':
    unittest.main()
