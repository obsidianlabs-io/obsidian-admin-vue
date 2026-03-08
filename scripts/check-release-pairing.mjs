import fs from 'node:fs';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const repoRoot = new URL('..', import.meta.url);
const tag = process.argv[2] || process.env.GITHUB_REF_NAME || '';

if (!tag) {
  fail('Release pairing check requires a tag like v1.1.1.');
}

const tagMatch = /^v(?<version>\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?)$/.exec(tag);
if (!tagMatch?.groups?.version) {
  fail(`Unsupported release tag format: ${tag}`);
}

const version = tagMatch.groups.version;
const packageJson = readJson('package.json');
const matrix = readText('docs/compatibility-matrix.md');
const changelog = readText('CHANGELOG.md');
const changelogZh = readText('CHANGELOG.zh_CN.md');
const releaseNotePath = pathOf(`docs/releases/${tag}.md`);
const backendRepo = 'https://github.com/obsidianlabs-io/obsidian-admin-laravel.git';

if (packageJson.version !== version) {
  fail(`package.json version ${packageJson.version} does not match tag ${tag}.`);
}

if (!fs.existsSync(releaseNotePath)) {
  fail(`Missing release note: docs/releases/${tag}.md`);
}

assertVersionHeading(changelog, version, 'CHANGELOG.md');
assertVersionHeading(changelogZh, version, 'CHANGELOG.zh_CN.md');

const stablePair = findFrontendStablePair(matrix, tag);
if (!stablePair) {
  fail(`Compatibility matrix does not declare ${tag} as a stable frontend release pair.`);
}

if (!remoteTagExists(backendRepo, stablePair.backend)) {
  fail(`Expected paired backend tag ${stablePair.backend} was not found in ${backendRepo}.`);
}

process.stdout.write(`Release pairing OK: ${tag} <-> ${stablePair.backend}\n`);

function pathOf(relativePath) {
  return new URL(relativePath, repoRoot).pathname;
}

function readText(relativePath) {
  return fs.readFileSync(pathOf(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function assertVersionHeading(content, versionValue, fileLabel) {
  const pattern = new RegExp(`^## \\[${escapeRegExp(versionValue)}\\](?:\\s|$)`, 'm');

  if (!pattern.test(content)) {
    fail(`${fileLabel} does not contain a release heading for ${versionValue}.`);
  }
}

function findFrontendStablePair(matrixContent, tagValue) {
  const match = matrixContent.split(/\r?\n/u).find(line => {
    const rowMatch = /^\|\s*`(?<frontend>v[^`]+)`\s*\|\s*`(?<backend>v[^`]+)`\s*\|\s*(?<status>[^|]+)\|/u.exec(line);

    return Boolean(
      rowMatch?.groups &&
      rowMatch.groups.frontend === tagValue &&
      rowMatch.groups.status.toLowerCase().includes('stable')
    );
  });

  const groups = /^\|\s*`(?<frontend>v[^`]+)`\s*\|\s*`(?<backend>v[^`]+)`\s*\|\s*(?<status>[^|]+)\|/u.exec(
    match ?? ''
  )?.groups;

  if (groups) {
    return {
      frontend: groups.frontend,
      backend: groups.backend
    };
  }

  return null;
}

function remoteTagExists(repo, tagValue) {
  try {
    const output = execFileSync('git', ['ls-remote', '--tags', repo, `refs/tags/${tagValue}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();

    return output.length > 0;
  } catch {
    return false;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
