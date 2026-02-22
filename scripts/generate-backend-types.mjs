/* eslint-disable no-continue, complexity */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  let backendRoot = '../obsidian-admin-laravel';
  let dtoDir = 'app/DTOs';
  let resourceDir = 'app';
  let outputPath = 'src/typings/api/backend-generated.d.ts';

  for (const arg of argv) {
    if (arg.startsWith('--backend=')) {
      backendRoot = arg.slice('--backend='.length);
      continue;
    }

    if (arg.startsWith('--dto-dir=')) {
      dtoDir = arg.slice('--dto-dir='.length);
      continue;
    }

    if (arg.startsWith('--resource-dir=')) {
      resourceDir = arg.slice('--resource-dir='.length);
      continue;
    }

    if (arg.startsWith('--output=')) {
      outputPath = arg.slice('--output='.length);
    }
  }

  return {
    backendRoot,
    dtoDir,
    resourceDir,
    outputPath
  };
}

function collectPhpFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = [];
  const queue = [dirPath];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.php')) {
        files.push(fullPath);
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function parsePhpNamespace(content) {
  const namespaceMatch = content.match(/namespace\s+([^;]+);/);
  if (!namespaceMatch) {
    return null;
  }

  return String(namespaceMatch[1]).trim();
}

function normalizePhpTypeToken(typeToken) {
  return typeToken.replace(/\s+/g, '');
}

function phpTypeToTs(typeToken) {
  const normalized = normalizePhpTypeToken(typeToken);
  if (normalized === '') {
    return 'unknown';
  }

  const isNullable = normalized.startsWith('?');
  const raw = isNullable ? normalized.slice(1) : normalized;
  const unionParts = raw.split('|').filter(Boolean);

  const mapped = unionParts.map(part => {
    const segment = part.toLowerCase();
    if (segment === 'string') return 'string';
    if (segment === 'int' || segment === 'integer' || segment === 'float' || segment === 'double') return 'number';
    if (segment === 'bool' || segment === 'boolean') return 'boolean';
    if (segment === 'array') return 'unknown[]';
    if (segment === 'mixed') return 'unknown';
    if (segment === 'null') return 'null';
    if (segment === 'false' || segment === 'true') return 'boolean';
    return 'unknown';
  });

  const unique = Array.from(new Set(mapped));

  if (isNullable && !unique.includes('null')) {
    unique.push('null');
  }

  return unique.join(' | ');
}

function parseDtoFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const namespace = parsePhpNamespace(content);
  if (!namespace || !namespace.startsWith('App\\DTOs\\')) {
    return null;
  }

  const classMatch = content.match(/(?:readonly\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (!classMatch) {
    return null;
  }

  const className = classMatch[1];
  const constructorMatch = content.match(/public function __construct\s*\(([\s\S]*?)\)\s*\{/m);
  if (!constructorMatch) {
    return null;
  }

  const constructorBody = constructorMatch[1];
  const fieldRegex = /public\s+([?A-Za-z0-9_|\\]+)\s+\$([A-Za-z_][A-Za-z0-9_]*)/g;
  /** @type {{name:string; type:string}[]} */
  const fields = [];

  let match = fieldRegex.exec(constructorBody);
  while (match) {
    fields.push({
      type: phpTypeToTs(match[1]),
      name: match[2]
    });
    match = fieldRegex.exec(constructorBody);
  }

  if (fields.length === 0) {
    return null;
  }

  const groupName = namespace.replace('App\\DTOs\\', '').split('\\')[0] ?? 'Common';
  return {
    groupName,
    interfaceName: className,
    fields
  };
}

function parseArrayAssignments(arrayBlock) {
  const regex = /^\s*'([^']+)'\s*=>\s*([\s\S]*?),(?=\n\s*'[^']+'\s*=>|$)/gm;
  /** @type {{name:string; expression:string}[]} */
  const entries = [];

  let match = regex.exec(arrayBlock);
  while (match) {
    entries.push({
      name: String(match[1]).trim(),
      expression: String(match[2]).trim()
    });
    match = regex.exec(arrayBlock);
  }

  return entries;
}

function inferResourceFieldType(expression) {
  const normalized = expression.replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();

  if (normalized.includes('ApiDateTime::formatForRequest(')) {
    return 'string';
  }

  if (normalized.includes('->all()')) {
    if (normalized.includes(': string') || normalized.includes(':string')) {
      return 'string[]';
    }

    if (normalized.includes(': int') || normalized.includes(':int')) {
      return 'number[]';
    }

    return 'unknown[]';
  }

  if (/^\$this->id$/.test(normalized) || normalized.includes('->timestamp')) {
    return 'number';
  }

  if (/^\$this->users_count$/.test(normalized) || /^\$this->roles_count$/.test(normalized)) {
    return 'number';
  }

  if (normalized.includes('(int)') || normalized.includes('timestamp')) {
    return 'number';
  }

  if (normalized.includes('(bool)')) {
    return 'boolean';
  }

  if (normalized.includes('in_array(') || normalized.includes('(string)')) {
    return 'string';
  }

  if (normalized.includes("?? '") || normalized.includes('?? "')) {
    return 'string';
  }

  if (normalized.includes('?? 0')) {
    return 'number';
  }

  if (normalized.includes('?? null')) {
    return 'unknown | null';
  }

  if (normalized.includes('?->') && !normalized.includes('??')) {
    return 'string | null';
  }

  if (
    /^\$this->(?:code|name|email|action|status|group|description|locale|translation_key|translation_value|request_id|ip_address|user_agent)$/.test(
      normalized
    )
  ) {
    return 'string';
  }

  if (lower.includes('tenant_id') || lower.includes('auditable_id')) {
    return 'string';
  }

  if (lower.includes('old_values') || lower.includes('new_values') || lower.includes('target')) {
    return 'unknown';
  }

  if (/^'.*'$/.test(normalized) || /^".*"$/.test(normalized)) {
    return 'string';
  }

  if (/^\d+$/.test(normalized)) {
    return 'number';
  }

  return 'unknown';
}

function parseResourceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const namespace = parsePhpNamespace(content);
  if (!namespace) {
    return null;
  }

  const isLegacyResource = namespace === 'App\\Http\\Resources';
  const isDomainResource = namespace.startsWith('App\\Domains\\') && namespace.endsWith('\\Http\\Resources');
  if (!isLegacyResource && !isDomainResource) {
    return null;
  }

  const classMatch = content.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (!classMatch) {
    return null;
  }

  const className = classMatch[1];
  const returnMatch = content.match(/return\s*\[([\s\S]*?)\n\s*];/m);
  if (!returnMatch) {
    return null;
  }

  const fields = parseArrayAssignments(returnMatch[1]).map(entry => ({
    name: entry.name,
    type: inferResourceFieldType(entry.expression)
  }));

  if (fields.length === 0) {
    return null;
  }

  return {
    interfaceName: className,
    fields
  };
}

function renderDtos(dtoEntries) {
  /** @type {Map<string, typeof dtoEntries>} */
  const grouped = new Map();

  for (const dto of dtoEntries) {
    const bucket = grouped.get(dto.groupName) ?? [];
    bucket.push(dto);
    grouped.set(dto.groupName, bucket);
  }

  const groups = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));
  const lines = [];

  for (const groupName of groups) {
    lines.push(`    namespace ${groupName} {`);

    const entries = grouped.get(groupName) ?? [];
    entries.sort((a, b) => a.interfaceName.localeCompare(b.interfaceName));

    for (const dto of entries) {
      lines.push(`      interface ${dto.interfaceName} {`);
      for (const field of dto.fields) {
        lines.push(`        ${field.name}: ${field.type};`);
      }
      lines.push('      }');
      lines.push('');
    }

    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    lines.push('    }');
    lines.push('');
  }

  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

function renderResources(resourceEntries) {
  const sorted = [...resourceEntries].sort((a, b) => a.interfaceName.localeCompare(b.interfaceName));
  const lines = [];

  for (const entry of sorted) {
    lines.push(`    interface ${entry.interfaceName} {`);
    for (const field of entry.fields) {
      lines.push(`      ${field.name}: ${field.type};`);
    }
    lines.push('    }');
    lines.push('');
  }

  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

function render(dtoEntries, resourceEntries, args) {
  const dtoLines = renderDtos(dtoEntries);
  const resourceLines = renderResources(resourceEntries);

  return `/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Generated by \`pnpm api:types\`.
 *
 * Sources:
 * - ${args.backendRoot}/${args.dtoDir}
 * - ${args.backendRoot}/${args.resourceDir}
 */
declare namespace BackendGenerated {
  namespace DTO {
${dtoLines.join('\n')}
  }

  namespace Resource {
${resourceLines.join('\n')}
  }
}
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const backendRootPath = path.resolve(process.cwd(), args.backendRoot);
  const dtoPath = path.resolve(backendRootPath, args.dtoDir);
  const resourcePath = path.resolve(backendRootPath, args.resourceDir);
  const outputPath = path.resolve(process.cwd(), args.outputPath);

  if (!fs.existsSync(backendRootPath)) {
    console.error(`Backend root not found: ${backendRootPath}`);
    process.exit(1);
  }

  const dtoEntries = collectPhpFiles(dtoPath).map(parseDtoFile).filter(Boolean);
  const resourceEntries = collectPhpFiles(resourcePath).map(parseResourceFile).filter(Boolean);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, render(dtoEntries, resourceEntries, args), 'utf8');

  console.log(`Generated backend DTO/resource typings: ${outputPath}`);
}

main();
