"""Exercise generator checks on isolated copies; never overwrite the live theme."""
from pathlib import Path
import hashlib
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent


class GeneratorChecks(unittest.TestCase):
    def setUp(self):
        backup_root = ROOT / 'tools/generator-backups'
        backup_root.mkdir(parents=True, exist_ok=True)
        self.temporary = tempfile.TemporaryDirectory(prefix='check-test-', dir=backup_root)
        self.addCleanup(self.temporary.cleanup)
        self.fixture = Path(self.temporary.name)
        paths = ['tools/build-homepage.py', 'tools/flat-layers.json', 'assets/asset-map.json',
                 'assets/css/homepage.css', 'assets/css/wide-measurements.css',
                 'assets/css/wide.css', 'assets/css/responsive.css', 'assets/js/homepage.js']
        paths += [p.relative_to(ROOT).as_posix() for p in (ROOT / 'template-parts/home').glob('*.php')]
        for relative in paths:
            target = self.fixture / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / relative, target)

    def hashes(self):
        return {p.relative_to(self.fixture).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                for p in self.fixture.rglob('*') if p.is_file()}

    def run_generator(self, *flags):
        return subprocess.run([sys.executable, str(self.fixture / 'tools/build-homepage.py'), *flags],
                              cwd=self.fixture, capture_output=True, text=True)

    def test_default_is_non_writing(self):
        before = self.hashes()
        result = self.run_generator()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('all 17 generated files match', result.stdout)
        self.assertEqual(self.hashes(), before)

    def test_check_preserves_a_manual_correction(self):
        stylesheet = self.fixture / 'assets/css/homepage.css'
        with stylesheet.open('a', encoding='utf-8') as stream:
            stream.write('\n/* Verified manual correction: retain for review. */\n')
        before = self.hashes()
        result = self.run_generator('--check')
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('assets/css/homepage.css', result.stdout)
        self.assertIn('theme files were not modified', result.stdout)
        self.assertEqual(self.hashes(), before)

    def test_explicit_write_backs_up_before_applying(self):
        # The fixture lives inside the current develop checkout; git commands
        # only read its branch/HEAD. All generated writes remain in the fixture.
        stylesheet = self.fixture / 'assets/css/homepage.css'
        with stylesheet.open('a', encoding='utf-8') as stream:
            stream.write('\n/* Verified manual correction: preserve in backup. */\n')
        before = self.hashes()
        result = self.run_generator('--write')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('Applied 1 changed generated files', result.stdout)
        backups = list((self.fixture / 'tools/generator-backups').glob('*/manifest.json'))
        self.assertEqual(len(backups), 1)
        backup = backups[0].parent
        for relative in ['assets/css/homepage.css', 'assets/css/wide.css',
                         'assets/css/responsive.css', 'assets/js/homepage.js']:
            self.assertEqual(hashlib.sha256((backup / relative).read_bytes()).hexdigest(), before[relative])
        self.assertEqual(stylesheet.read_bytes(), (ROOT / 'assets/css/homepage.css').read_bytes())
        for relative in ['assets/css/wide.css', 'assets/css/responsive.css', 'assets/js/homepage.js']:
            self.assertEqual(hashlib.sha256((self.fixture / relative).read_bytes()).hexdigest(), before[relative])


if __name__ == '__main__':
    unittest.main()
