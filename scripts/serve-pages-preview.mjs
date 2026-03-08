import process from 'node:process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

function parseArgs(argv) {
  const options = {
    root: '.pages-dist',
    base: '/obsidian-admin-vue',
    port: 4174
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--root') {
      options.root = argv[index + 1] || options.root;
      index += 1;
    } else if (arg === '--base') {
      options.base = argv[index + 1] || options.base;
      index += 1;
    } else if (arg === '--port') {
      const value = Number(argv[index + 1]);
      options.port = Number.isFinite(value) ? value : options.port;
      index += 1;
    }
  }

  return options;
}

function contentType(pathname) {
  switch (extname(pathname)) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.ico':
      return 'image/x-icon';
    case '.txt':
      return 'text/plain; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function resolvePath(root, value) {
  const normalizedPath = normalize(join(root, value));

  if (!normalizedPath.startsWith(root)) {
    return null;
  }

  return normalizedPath;
}

const options = parseArgs(process.argv.slice(2));
const root = resolve(process.cwd(), options.root);
const basePath = options.base.replace(/\/+$/, '');

async function serveCandidate(context, candidate) {
  const filePath = resolvePath(context.rootDir, candidate);

  if (!filePath) {
    return false;
  }

  try {
    const body = await readFile(filePath);

    context.response.writeHead(200, { 'content-type': contentType(filePath) });

    if (context.request.method === 'HEAD') {
      context.response.end();
    } else {
      context.response.end(body);
    }

    return true;
  } catch {
    return false;
  }
}

async function serveCandidates(context, candidates) {
  if (candidates.length === 0) {
    return false;
  }

  const [candidate, ...rest] = candidates;

  if (await serveCandidate(context, candidate)) {
    return true;
  }

  return serveCandidates(context, rest);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);

  if (!url.pathname.startsWith(basePath)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const relativePath = url.pathname.slice(basePath.length) || '/';
  const trimmedPath = relativePath.replace(/^\/+/, '');
  const candidateFiles = [];

  if (!trimmedPath) {
    candidateFiles.push('index.html');
  } else {
    candidateFiles.push(trimmedPath);

    if (relativePath.endsWith('/')) {
      candidateFiles.push(join(trimmedPath, 'index.html'));
    }
  }

  if (relativePath === '/preview' || relativePath.startsWith('/preview/')) {
    candidateFiles.push('preview/index.html');
  } else {
    candidateFiles.push('index.html');
  }

  const served = await serveCandidates({ request, response, rootDir: root }, candidateFiles);

  if (served) {
    return;
  }

  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  response.end('Not found');
});

server.listen(options.port, '127.0.0.1', () => {
  process.stdout.write(`Pages preview server listening on http://127.0.0.1:${String(options.port)}${basePath}/\n`);
});
