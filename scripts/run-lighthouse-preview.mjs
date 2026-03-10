import process from 'node:process';
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const server = spawn(
  'node',
  ['scripts/serve-pages-preview.mjs', '--root', '.pages-dist', '--base', '/obsidian-admin-vue', '--port', '4174'],
  {
    stdio: 'inherit',
    env: process.env
  }
);

async function waitForServer(url, remaining = 50) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return;
    }
  } catch {
    // keep waiting
  }

  if (remaining <= 1) {
    throw new Error(`Timed out waiting for ${url}`);
  }

  await delay(500);
  await waitForServer(url, remaining - 1);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: process.env });
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'null'}`));
    });
    child.on('error', reject);
  });
}

async function readManifest() {
  const content = await readFile('build/lighthouse/manifest.json', 'utf8');
  return JSON.parse(content);
}

function assertScore(entry, category, thresholds) {
  const value = entry.summary[category];
  const { minScore, mode = 'fail' } = thresholds;

  if (typeof value !== 'number') {
    throw new TypeError(`Missing Lighthouse category "${category}" for ${entry.url}`);
  }

  if (value >= minScore) {
    return;
  }

  const message = `Lighthouse ${mode}: ${entry.url} ${category} score ${value.toFixed(2)} is below ${minScore.toFixed(2)}`;
  if (mode === 'warn') {
    console.warn(message);
    return;
  }

  throw new Error(message);
}

async function enforceThresholds() {
  const manifest = await readManifest();
  const root = manifest.find(entry => entry.url === 'http://127.0.0.1:4174/obsidian-admin-vue/');
  const preview = manifest.find(entry => entry.url === 'http://127.0.0.1:4174/obsidian-admin-vue/preview/');

  if (!root || !preview) {
    throw new Error('Lighthouse manifest is missing root or preview entries.');
  }

  console.log('Lighthouse representative scores:', {
    root: root.summary,
    preview: preview.summary
  });

  assertScore(root, 'accessibility', { minScore: 0.95 });
  assertScore(root, 'best-practices', { minScore: 0.95 });
  assertScore(root, 'performance', { minScore: 0.7 });
  assertScore(root, 'performance', { minScore: 0.9, mode: 'warn' });

  assertScore(preview, 'accessibility', { minScore: 0.9 });
  assertScore(preview, 'best-practices', { minScore: 0.95 });
  assertScore(preview, 'performance', { minScore: 0.7, mode: 'warn' });
}

try {
  await mkdir('build/lighthouse', { recursive: true });
  await waitForServer('http://127.0.0.1:4174/obsidian-admin-vue/preview/');
  await run('pnpm', ['exec', 'lhci', 'autorun', '--config=lighthouserc.preview.json']);
  await enforceThresholds();
} finally {
  server.kill('SIGTERM');
}
