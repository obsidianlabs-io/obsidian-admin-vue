import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');
const apiRoot = path.join(srcRoot, 'service/api');
const requestEntry = path.join(srcRoot, 'service/request/index.ts');
const generatedRoot = path.join(apiRoot, 'generated');
const generatedAdapter = path.join(apiRoot, 'generated-adapter.ts');
const generatedCaller = path.join(apiRoot, 'generated-caller.ts');

const allowedRequestImporters = new Set([generatedAdapter]);

const allowedGeneratedImporters = new Set([generatedAdapter, generatedCaller]);

const supportedExtensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.mjs', '.vue'];
const importPattern =
  /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.name.startsWith('.')) {
      // ignore dotfiles/directories
    } else if (entry.isDirectory()) {
      if (fullPath === generatedRoot) {
        files.push(...walkFiles(fullPath));
      } else {
        files.push(...walkFiles(fullPath));
      }
    } else if (supportedExtensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveSpecifier(fromFile, specifier) {
  let basePath;

  if (specifier.startsWith('@/')) {
    basePath = path.join(srcRoot, specifier.slice(2));
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    basePath = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [basePath];

  for (const ext of supportedExtensions) {
    candidates.push(`${basePath}${ext}`);
  }

  for (const ext of supportedExtensions) {
    candidates.push(path.join(basePath, `index${ext}`));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.normalize(candidate);
    }
  }

  return null;
}

function isInside(dir, file) {
  const relative = path.relative(dir, file);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function isAllowedRequestImporter(filePath) {
  return isInside(apiRoot, filePath) || allowedRequestImporters.has(filePath);
}

function isAllowedGeneratedImporter(filePath) {
  return isInside(generatedRoot, filePath) || allowedGeneratedImporters.has(filePath);
}

function collectViolations() {
  const violations = [];
  const files = walkFiles(srcRoot);

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8');
    let match = importPattern.exec(source);

    while (match) {
      const specifier = match[1] || match[2];
      const resolved = resolveSpecifier(filePath, specifier);

      if (resolved === requestEntry && !isAllowedRequestImporter(filePath)) {
        violations.push(
          `${path.relative(projectRoot, filePath)} imports the request entrypoint directly. Use a facade in src/service/api/* instead.`
        );
      }

      if (
        resolved &&
        (resolved === generatedRoot || isInside(generatedRoot, resolved)) &&
        !isAllowedGeneratedImporter(filePath)
      ) {
        violations.push(
          `${path.relative(projectRoot, filePath)} imports the generated SDK directly. Route access through src/service/api facades or generated-adapter.ts.`
        );
      }

      match = importPattern.exec(source);
    }

    importPattern.lastIndex = 0;
  }

  return violations;
}

const violations = collectViolations();

if (violations.length > 0) {
  console.error('Frontend API architecture gate failed:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Frontend API architecture gate passed.');
