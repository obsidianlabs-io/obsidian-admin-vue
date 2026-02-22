/* eslint-disable no-continue, max-params, complexity, no-nested-ternary */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

function parseArgs(argv) {
  let write = false;
  let check = false;
  let sourceDir = 'src/service/api';
  let snapshotPath = 'docs/api-client-contract.snapshot';

  for (const arg of argv) {
    if (arg === '--write') {
      write = true;
      continue;
    }

    if (arg === '--check') {
      check = true;
      continue;
    }

    if (arg.startsWith('--source=')) {
      sourceDir = arg.slice('--source='.length);
      continue;
    }

    if (arg.startsWith('--snapshot=')) {
      snapshotPath = arg.slice('--snapshot='.length);
    }
  }

  if (!write && !check) {
    check = true;
  }

  return {
    write,
    check,
    sourceDir,
    snapshotPath
  };
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizePath(url) {
  const trimmed = url.trim();
  if (trimmed === '') {
    return '/';
  }

  const prefixed = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return prefixed.replace(/\/{2,}/g, '/');
}

function loadGeneratedSdkMap() {
  const sdkPath = path.resolve(process.cwd(), 'src/service/api/generated/sdk.gen.ts');
  if (!fs.existsSync(sdkPath)) {
    return new Map();
  }

  const raw = fs.readFileSync(sdkPath, 'utf8');
  const map = new Map();
  const regex =
    /export const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*<[\s\S]*?>\s*\(options[\s\S]*?\)\s*=>\s*\(options[\s\S]*?\)\.([a-z]+)<[\s\S]*?\{\s*url:\s*'([^']+)'/g;

  let match = regex.exec(raw);
  while (match) {
    map.set(match[1], {
      method: String(match[2]).toUpperCase(),
      path: normalizePath(match[3])
    });
    match = regex.exec(raw);
  }

  return map;
}

function renderTemplateExpression(node, sourceFile) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  let result = node.head.text;

  node.templateSpans.forEach((span, index) => {
    const expression = span.expression;
    const raw = normalizeWhitespace(expression.getText(sourceFile));
    const placeholder = raw !== '' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(raw) ? raw : `expr${index + 1}`;

    result += `{${placeholder}}${span.literal.text}`;
  });

  return result;
}

function extractObjectLiteral(callExpression) {
  const [firstArg] = callExpression.arguments;
  if (!firstArg || !ts.isObjectLiteralExpression(firstArg)) {
    return null;
  }

  return firstArg;
}

function findProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const name = property.name.getText();
    if (name === propertyName) {
      return property;
    }
  }

  return null;
}

function extractMethod(objectLiteral) {
  const methodProperty = findProperty(objectLiteral, 'method');
  if (!methodProperty) {
    return 'GET';
  }

  const initializer = methodProperty.initializer;
  if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
    const method = initializer.text.trim();
    if (method !== '') {
      return method.toUpperCase();
    }
  }

  return 'GET';
}

function extractUrl(objectLiteral, sourceFile) {
  const urlProperty = findProperty(objectLiteral, 'url');
  if (!urlProperty) {
    return null;
  }

  const initializer = urlProperty.initializer;

  if (
    ts.isStringLiteral(initializer) ||
    ts.isNoSubstitutionTemplateLiteral(initializer) ||
    ts.isTemplateExpression(initializer)
  ) {
    return normalizePath(renderTemplateExpression(initializer, sourceFile));
  }

  if (
    ts.isCallExpression(initializer) &&
    ts.isIdentifier(initializer.expression) &&
    initializer.expression.text === 'buildPath'
  ) {
    const [pathTemplateNode] = initializer.arguments;
    if (
      pathTemplateNode &&
      (ts.isStringLiteral(pathTemplateNode) ||
        ts.isNoSubstitutionTemplateLiteral(pathTemplateNode) ||
        ts.isTemplateExpression(pathTemplateNode))
    ) {
      return normalizePath(renderTemplateExpression(pathTemplateNode, sourceFile));
    }
  }

  return normalizePath(`[dynamic:${normalizeWhitespace(initializer.getText(sourceFile))}]`);
}

function parseRequestEntry(functionDeclaration, sourceFile, relativeFile, generatedSdkMap) {
  const functionName = functionDeclaration.name?.text;
  if (!functionName || !functionDeclaration.body) {
    return null;
  }

  const returnStatement = functionDeclaration.body.statements.find(ts.isReturnStatement);
  if (!returnStatement || !returnStatement.expression) {
    return null;
  }

  let expressionNode = returnStatement.expression;
  while (ts.isAsExpression(expressionNode) || ts.isSatisfiesExpression?.(expressionNode)) {
    expressionNode = expressionNode.expression;
  }

  if (!ts.isCallExpression(expressionNode)) {
    return null;
  }

  const callExpression = expressionNode;
  const expression = callExpression.expression;

  if (ts.isIdentifier(expression) && expression.text === 'callGenerated') {
    const [executorArg] = callExpression.arguments;
    if (executorArg && (ts.isArrowFunction(executorArg) || ts.isFunctionExpression(executorArg))) {
      const body = executorArg.body;
      const nestedCall = ts.isCallExpression(body)
        ? body
        : ts.isBlock(body)
          ? body.statements.find(ts.isReturnStatement)?.expression
          : null;

      if (nestedCall && ts.isCallExpression(nestedCall) && ts.isIdentifier(nestedCall.expression)) {
        const generatedFnName = nestedCall.expression.text;
        const generatedEntry = generatedSdkMap.get(generatedFnName);
        if (generatedEntry) {
          const responseTypeNode = callExpression.typeArguments?.[0];
          const responseType = responseTypeNode ? normalizeWhitespace(responseTypeNode.getText(sourceFile)) : 'unknown';
          const params = functionDeclaration.parameters
            .map(param => {
              const name = normalizeWhitespace(param.name.getText(sourceFile));
              const typeText = param.type ? normalizeWhitespace(param.type.getText(sourceFile)) : 'unknown';
              return `${name}:${typeText}`;
            })
            .join(', ');

          return {
            file: relativeFile,
            fn: functionName,
            method: generatedEntry.method,
            path: generatedEntry.path,
            responseType,
            params: params === '' ? '-' : params
          };
        }
      }
    }

    return null;
  }

  if (!ts.isIdentifier(expression) || expression.text !== 'request') {
    return null;
  }

  const objectLiteral = extractObjectLiteral(callExpression);
  if (!objectLiteral) {
    return null;
  }

  const responseTypeNode = callExpression.typeArguments?.[0];
  const responseType = responseTypeNode ? normalizeWhitespace(responseTypeNode.getText(sourceFile)) : 'unknown';

  const method = extractMethod(objectLiteral);
  const endpointPath = extractUrl(objectLiteral, sourceFile);
  if (!endpointPath) {
    return null;
  }

  const params = functionDeclaration.parameters
    .map(param => {
      const name = normalizeWhitespace(param.name.getText(sourceFile));
      const typeText = param.type ? normalizeWhitespace(param.type.getText(sourceFile)) : 'unknown';
      return `${name}:${typeText}`;
    })
    .join(', ');

  return {
    file: relativeFile,
    fn: functionName,
    method,
    path: endpointPath,
    responseType,
    params: params === '' ? '-' : params
  };
}

function listApiFiles(sourceDir) {
  const result = [];
  const generatedDirName = 'generated';

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === generatedDirName) {
          continue;
        }
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!entry.name.endsWith('.ts') || entry.name === 'index.ts') {
        continue;
      }

      result.push(fullPath);
    }
  }

  walk(sourceDir);

  result.sort((a, b) => a.localeCompare(b));

  return result;
}

function collectContracts(sourceDir) {
  const apiFiles = listApiFiles(sourceDir);
  const generatedSdkMap = loadGeneratedSdkMap();
  const entries = [];

  for (const filePath of apiFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const relativeFile = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

    for (const statement of sourceFile.statements) {
      if (!ts.isFunctionDeclaration(statement)) {
        continue;
      }

      const isExported = statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      if (!isExported) {
        continue;
      }

      const contract = parseRequestEntry(statement, sourceFile, relativeFile, generatedSdkMap);
      if (contract) {
        entries.push(contract);
      }
    }
  }

  entries.sort((a, b) => {
    const fileCompare = a.file.localeCompare(b.file);
    if (fileCompare !== 0) {
      return fileCompare;
    }

    return a.fn.localeCompare(b.fn);
  });

  return entries;
}

function toSnapshotLine(entry) {
  return `[${entry.file}] ${entry.fn} | ${entry.method} ${entry.path} | response=${entry.responseType} | params=${entry.params}`;
}

function renderSnapshot(entries) {
  const header = [
    '# Frontend API client contract snapshot',
    '# Generated by: pnpm contract:write',
    '# Review this file when frontend service/api contract changes.',
    ''
  ];

  const lines = entries.map(toSnapshotLine);

  return [...header, ...lines, ''].join('\n');
}

function parseSnapshotLines(content) {
  return content
    .split(/\r?\n/g)
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceDir = path.resolve(process.cwd(), args.sourceDir);
  const snapshotPath = path.resolve(process.cwd(), args.snapshotPath);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    process.exit(1);
  }

  const entries = collectContracts(sourceDir);
  const currentLines = entries.map(toSnapshotLine);

  if (args.write) {
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, renderSnapshot(entries), 'utf8');
    console.log(`Frontend API contract snapshot updated: ${snapshotPath}`);
    process.exit(0);
  }

  if (args.check) {
    if (!fs.existsSync(snapshotPath)) {
      console.error(`Snapshot file is missing: ${snapshotPath}`);
      console.error('Run: pnpm contract:write');
      process.exit(1);
    }

    const expectedLines = parseSnapshotLines(fs.readFileSync(snapshotPath, 'utf8'));

    if (
      expectedLines.length === currentLines.length &&
      expectedLines.every((line, index) => line === currentLines[index])
    ) {
      console.log('Frontend API contract snapshot is up to date.');
      process.exit(0);
    }

    const expectedSet = new Set(expectedLines);
    const currentSet = new Set(currentLines);

    const removed = expectedLines.filter(line => !currentSet.has(line));
    const added = currentLines.filter(line => !expectedSet.has(line));

    console.error('Frontend API contract snapshot mismatch detected.');

    if (removed.length > 0) {
      console.error('Removed or changed entries:');
      removed.slice(0, 20).forEach(line => {
        console.error(`  - ${line}`);
      });
    }

    if (added.length > 0) {
      console.error('New or changed entries:');
      added.slice(0, 20).forEach(line => {
        console.error(`  + ${line}`);
      });
    }

    console.error('If the change is intentional, run: pnpm contract:write');
    process.exit(1);
  }
}

main();
