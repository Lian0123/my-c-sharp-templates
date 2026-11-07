"""The browser entry script must work in clean CI shells without inherited URLs."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[2] / 'scripts' / 'test-e2e.sh'


class E2eEnvironmentTests(unittest.TestCase):
    def invoke(self, overrides=None):
        with tempfile.TemporaryDirectory() as directory:
            docker = Path(directory) / 'docker'
            docker.write_text('#!/bin/sh\nprintf "%s\\n" "$BASE_URL" "$PUBLIC_URL" "$MAILPIT_URL"\nexit 77\n')
            docker.chmod(0o755)
            env = os.environ.copy()
            for key in ['BASE_URL', 'PUBLIC_URL', 'MAILPIT_URL', 'TEST_HTTP_PORT', 'TEST_MAILPIT_PORT']:
                env.pop(key, None)
            env.update(overrides or {})
            env['PATH'] = directory + os.pathsep + env['PATH']
            result = subprocess.run(['/bin/sh', str(SCRIPT)], env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 77, result.stderr)
            return result.stdout.splitlines()

    def test_defaults_without_inherited_base_url(self):
        self.assertEqual(self.invoke(), ['http://localhost:18080', 'http://localhost:18080', 'http://localhost:18025'])

    def test_custom_listener_ports(self):
        self.assertEqual(self.invoke({'TEST_HTTP_PORT': '19080', 'TEST_MAILPIT_PORT': '19025'}),
                         ['http://localhost:19080', 'http://localhost:19080', 'http://localhost:19025'])

    def test_explicit_browser_and_mail_urls(self):
        self.assertEqual(self.invoke({'BASE_URL': 'http://gateway:8080', 'MAILPIT_URL': 'http://mailpit:8025'}),
                         ['http://gateway:8080', 'http://gateway:8080', 'http://mailpit:8025'])


if __name__ == '__main__':
    unittest.main()
