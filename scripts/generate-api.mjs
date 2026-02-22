/* eslint-disable no-continue */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const DEFAULT_REMOTE_SPEC = 'http://localhost:8080/docs/api.json';
const DEFAULT_LOCAL_SPEC = '../obsidian-admin-laravel/docs/openapi.yaml';
const DEFAULT_OUTPUT_DIR = 'src/service/api/generated';

function parseArgs(argv) {
  const parsed = {
    spec: '',
    remote: process.env.OPENAPI_URL || DEFAULT_REMOTE_SPEC,
    local: process.env.OPENAPI_FILE || DEFAULT_LOCAL_SPEC,
    output: process.env.OPENAPI_OUTPUT || DEFAULT_OUTPUT_DIR
  };

  for (const arg of argv) {
    if (arg.startsWith('--spec=')) {
      parsed.spec = arg.slice('--spec='.length).trim();
      continue;
    }

    if (arg.startsWith('--url=')) {
      parsed.remote = arg.slice('--url='.length).trim();
      continue;
    }

    if (arg.startsWith('--file=')) {
      parsed.local = arg.slice('--file='.length).trim();
      continue;
    }

    if (arg.startsWith('--output=')) {
      parsed.output = arg.slice('--output='.length).trim();
    }
  }

  return parsed;
}

function isRemoteSpec(input) {
  return /^https?:\/\//i.test(input);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function fetchRemoteSpecToCache(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.text();
    const extension = url.toLowerCase().includes('.yaml') || url.toLowerCase().includes('.yml') ? 'yaml' : 'json';
    const cacheDir = path.resolve(process.cwd(), 'node_modules/.cache/openapi');
    const cacheFile = path.join(cacheDir, `remote-spec.${extension}`);

    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, payload, 'utf8');

    return cacheFile;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveSpecInput(options) {
  if (options.spec !== '') {
    if (isRemoteSpec(options.spec)) {
      console.log(`[generate-api] Fetching explicit remote spec: ${options.spec}`);
      return fetchRemoteSpecToCache(options.spec);
    }

    const absoluteSpec = path.resolve(process.cwd(), options.spec);
    if (!fs.existsSync(absoluteSpec)) {
      throw new Error(`Specified spec file not found: ${absoluteSpec}`);
    }
    console.log(`[generate-api] Using explicit local spec: ${absoluteSpec}`);

    return absoluteSpec;
  }

  const remoteUrl = String(options.remote || '').trim();
  if (remoteUrl !== '') {
    try {
      console.log(`[generate-api] Fetching remote spec: ${remoteUrl}`);
      return await fetchRemoteSpecToCache(remoteUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[generate-api] Remote spec unavailable (${message}), fallback to local file.`);
    }
  }

  const localSpec = path.resolve(process.cwd(), options.local);
  if (!fs.existsSync(localSpec)) {
    throw new Error(`Local fallback spec not found: ${localSpec}`);
  }

  console.log(`[generate-api] Using local fallback spec: ${localSpec}`);
  return localSpec;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const specInput = await resolveSpecInput(options);
  const outputDir = path.resolve(process.cwd(), options.output);

  console.log(`[generate-api] Generating official SDK to: ${outputDir}`);
  run('openapi-ts', ['-i', specInput, '-o', outputDir, '-c', '@hey-api/client-axios']);

  console.log('[generate-api] Regenerating frontend contract typings...');
  run('node', ['scripts/generate-openapi-types.mjs']);
  run('node', ['scripts/generate-backend-types.mjs']);

  console.log('[generate-api] Done.');
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[generate-api] Failed: ${message}`);
  process.exit(1);
});
