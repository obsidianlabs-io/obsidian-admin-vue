import process from 'node:process';
import { cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const docsDist = resolve(root, 'docs/.vitepress/dist');
const demoDist = resolve(root, 'demo-dist');
const pagesDist = resolve(root, '.pages-dist');
const previewDist = resolve(pagesDist, 'preview');

await rm(pagesDist, { recursive: true, force: true });
await cp(docsDist, pagesDist, { recursive: true });
await rm(previewDist, { recursive: true, force: true });
await cp(demoDist, previewDist, { recursive: true });

process.stdout.write(`Assembled Pages bundle at ${pagesDist}\n`);
