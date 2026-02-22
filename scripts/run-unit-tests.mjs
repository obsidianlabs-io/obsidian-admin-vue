import { readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsRoot = path.join(projectRoot, 'tests');

function collectUnitTests(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectUnitTests(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

const testFiles = collectUnitTests(testsRoot).sort();

if (testFiles.length === 0) {
  console.error('No unit test files found matching tests/**/*.test.ts');
  process.exit(1);
}

const child = spawn(process.execPath, ['--test', '--import', 'tsx', ...testFiles], {
  cwd: projectRoot,
  stdio: 'inherit'
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on('error', error => {
  console.error(error);
  process.exit(1);
});
