import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const targets = [
  'README*',
  'CHANGELOG*',
  'CONTRIBUTING.md',
  'SUPPORT.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  '.github/**/*',
  'docs/**/*'
];
const patterns = [/\/Users\/[A-Za-z0-9._-]+\//, /\/home\/runner\/work\//, /[A-Za-z]:\\Users\\/, /file:\/\//];

const output = execFileSync('git', ['-C', repoRoot, 'ls-files', ...targets], { encoding: 'utf8' });
const files = output.split('\n').filter(Boolean);
const failures = [];

for (const relativePath of files) {
  const absolutePath = path.join(repoRoot, relativePath);
  const contents = readFileSync(absolutePath, 'utf8');
  const lines = contents.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (patterns.some(pattern => pattern.test(line))) {
      failures.push(`${relativePath}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (failures.length > 0) {
  console.error('Public text files contain machine-specific absolute paths:');
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Public path safety check passed.');
