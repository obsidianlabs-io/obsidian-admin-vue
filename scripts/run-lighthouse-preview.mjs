import process from 'node:process';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
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

try {
  await mkdir('build/lighthouse', { recursive: true });
  await waitForServer('http://127.0.0.1:4174/obsidian-admin-vue/preview/');
  await run('pnpm', ['exec', 'lhci', 'autorun', '--config=lighthouserc.preview.json']);
} finally {
  server.kill('SIGTERM');
}
