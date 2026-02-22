/* eslint-disable no-continue */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  let frontendSnapshot = 'docs/api-client-contract.snapshot';
  let backendSnapshot = '../obsidian-admin-laravel/docs/api-contract.snapshot';
  let allowlistPath = 'docs/api-backend-compat.allowlist.json';
  let check = false;

  for (const arg of argv) {
    if (arg === '--check') {
      check = true;
      continue;
    }

    if (arg.startsWith('--frontend=')) {
      frontendSnapshot = arg.slice('--frontend='.length);
      continue;
    }

    if (arg.startsWith('--backend=')) {
      backendSnapshot = arg.slice('--backend='.length);
      continue;
    }

    if (arg.startsWith('--allowlist=')) {
      allowlistPath = arg.slice('--allowlist='.length);
    }
  }

  if (!check) {
    check = true;
  }

  return {
    check,
    frontendSnapshot,
    backendSnapshot,
    allowlistPath
  };
}

function normalizePath(rawPath) {
  const trimmed = String(rawPath ?? '').trim();
  if (trimmed === '') {
    return '/';
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/{2,}/g, '/');
}

function normalizeBackendContractPath(rawPath) {
  let normalized = String(rawPath ?? '').trim();
  normalized = normalized.replace(/^api\/v1\//, '');
  normalized = normalized.replace(/^api\//, '');

  return normalizePath(normalized);
}

function parseFrontendSnapshot(content) {
  const lines = content
    .split(/\r?\n/g)
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'));

  const entries = [];

  for (const line of lines) {
    const match = line.match(/^\[[^\]]+\]\s+[A-Za-z0-9_]+\s+\|\s+([A-Z]+)\s+([^|]+)\s+\|/);
    if (!match) {
      continue;
    }

    entries.push({
      method: String(match[1]).toUpperCase(),
      path: normalizePath(match[2])
    });
  }

  return dedupeEntries(entries);
}

function parseBackendSnapshot(content) {
  const lines = content
    .split(/\r?\n/g)
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'));

  const entries = [];

  for (const line of lines) {
    const match = line.match(/^([A-Z]+)\s+(.+)$/);
    if (!match) {
      continue;
    }

    entries.push({
      method: String(match[1]).toUpperCase(),
      path: normalizeBackendContractPath(match[2])
    });
  }

  return dedupeEntries(entries);
}

function dedupeEntries(entries) {
  const seen = new Set();
  const result = [];

  for (const entry of entries) {
    const key = `${entry.method} ${entry.path}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(entry);
  }

  return result;
}

function isPlaceholderSegment(segment) {
  return /^\{[^/{}]+\}$/.test(segment);
}

function arePathsCompatible(frontPath, backendPath) {
  const frontSegments = frontPath.split('/').filter(Boolean);
  const backendSegments = backendPath.split('/').filter(Boolean);

  if (frontSegments.length !== backendSegments.length) {
    return false;
  }

  for (let i = 0; i < frontSegments.length; i += 1) {
    const frontSeg = frontSegments[i];
    const backSeg = backendSegments[i];

    if (frontSeg === backSeg) {
      continue;
    }

    if (isPlaceholderSegment(frontSeg) || isPlaceholderSegment(backSeg)) {
      continue;
    }

    return false;
  }

  return true;
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`);
}

function loadAllowlist(allowlistPath) {
  if (!fs.existsSync(allowlistPath)) {
    return [];
  }

  const raw = fs.readFileSync(allowlistPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.ignore)) {
    return [];
  }

  return parsed.ignore
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const method = String(item.method ?? '*').toUpperCase();
      const pathPattern = normalizePath(String(item.path ?? '*'));
      return {
        method,
        pathPattern,
        reason: String(item.reason ?? '')
      };
    });
}

function isIgnored(entry, allowlist) {
  return allowlist.some(rule => {
    const methodMatch = rule.method === '*' || rule.method === entry.method;
    if (!methodMatch) {
      return false;
    }

    return wildcardToRegExp(rule.pathPattern).test(entry.path);
  });
}

function formatEntry(entry) {
  return `${entry.method} ${entry.path}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const frontendSnapshotPath = path.resolve(process.cwd(), args.frontendSnapshot);
  const backendSnapshotPath = path.resolve(process.cwd(), args.backendSnapshot);
  const allowlistPath = path.resolve(process.cwd(), args.allowlistPath);

  if (!fs.existsSync(frontendSnapshotPath)) {
    console.error(`Frontend snapshot file is missing: ${frontendSnapshotPath}`);
    console.error('Run: pnpm contract:write');
    process.exit(1);
  }

  if (!fs.existsSync(backendSnapshotPath)) {
    console.error(`Backend snapshot file is missing: ${backendSnapshotPath}`);
    console.error('Expected backend contract snapshot generated from Laravel: docs/api-contract.snapshot');
    process.exit(1);
  }

  const allowlist = loadAllowlist(allowlistPath);
  const frontendEntries = parseFrontendSnapshot(fs.readFileSync(frontendSnapshotPath, 'utf8'));
  const backendEntries = parseBackendSnapshot(fs.readFileSync(backendSnapshotPath, 'utf8'));

  const mismatches = [];

  for (const frontEntry of frontendEntries) {
    if (isIgnored(frontEntry, allowlist)) {
      continue;
    }

    const backendCandidates = backendEntries.filter(item => item.method === frontEntry.method);
    const matched = backendCandidates.some(candidate => arePathsCompatible(frontEntry.path, candidate.path));

    if (!matched) {
      mismatches.push(frontEntry);
    }
  }

  if (mismatches.length === 0) {
    console.log('Frontend to backend API contract compatibility check passed.');
    process.exit(0);
  }

  console.error('Frontend to backend API contract compatibility check failed.');
  console.error('The following frontend endpoints are not present in backend contract:');

  mismatches.slice(0, 30).forEach(entry => {
    console.error(`  - ${formatEntry(entry)}`);
  });

  if (mismatches.length > 30) {
    console.error(`  ... and ${mismatches.length - 30} more`);
  }

  if (allowlist.length > 0) {
    console.error(`Allowlist file used: ${allowlistPath}`);
  }

  process.exit(1);
}

main();
