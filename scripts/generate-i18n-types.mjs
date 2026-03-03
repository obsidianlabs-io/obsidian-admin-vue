import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceLocalePath = path.join(projectRoot, 'src/locales/langs/en-us.ts');
const targetLocalePath = path.join(projectRoot, 'src/locales/langs/zh-cn.ts');
const outputPath = path.join(projectRoot, 'src/typings/i18n-generated.d.ts');

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toPath(parent, key) {
  return parent ? `${parent}.${key}` : key;
}

function getPropertyName(node, sourceFile) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }

  throw new Error(`Unsupported i18n key syntax: ${node.getText(sourceFile)}`);
}

function unwrapExpression(node) {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) {
    return unwrapExpression(node.expression);
  }

  return node;
}

function resolveRelativeModule(fromFilePath, moduleSpecifier) {
  const basePath = path.resolve(path.dirname(fromFilePath), moduleSpecifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.mts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    path.join(basePath, 'index.ts')
  ];

  const resolved = candidates.find(candidate => existsSync(candidate));
  if (!resolved) {
    throw new Error(`Cannot resolve import "${moduleSpecifier}" from ${fromFilePath}`);
  }

  return resolved;
}

const localeShapeCache = new Map();

function parseLocaleShapeFromFile(filePath) {
  const normalizedPath = path.resolve(filePath);
  const cached = localeShapeCache.get(normalizedPath);
  if (cached) {
    return cached;
  }

  const content = readFileSync(normalizedPath, 'utf8');
  const sourceFile = ts.createSourceFile(normalizedPath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const variableMap = new Map();
  const importMap = new Map();
  let defaultExportExpression = null;

  sourceFile.statements.forEach(statement => {
    if (ts.isImportDeclaration(statement)) {
      const importClause = statement.importClause;
      if (
        importClause?.name &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text.startsWith('.')
      ) {
        importMap.set(importClause.name.text, resolveRelativeModule(normalizedPath, statement.moduleSpecifier.text));
      }

      return;
    }

    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          variableMap.set(declaration.name.text, declaration.initializer);
        }
      });
      return;
    }

    if (ts.isExportAssignment(statement)) {
      defaultExportExpression = statement.expression;
    }
  });

  const rootExpression = variableMap.get('local') || defaultExportExpression;
  if (!rootExpression) {
    throw new Error(`Cannot find "local" locale object in ${normalizedPath}`);
  }

  const resolvingIdentifiers = new Set();

  function resolveIdentifier(name) {
    if (resolvingIdentifiers.has(name)) {
      throw new Error(`Circular locale reference detected for identifier "${name}" in ${normalizedPath}`);
    }

    if (variableMap.has(name)) {
      resolvingIdentifiers.add(name);
      const result = parseExpression(variableMap.get(name));
      resolvingIdentifiers.delete(name);
      return result;
    }

    if (importMap.has(name)) {
      return parseLocaleShapeFromFile(importMap.get(name));
    }

    throw new Error(`Cannot resolve identifier "${name}" in ${normalizedPath}`);
  }

  function parseObjectLiteral(objectLiteral) {
    const result = {};

    objectLiteral.properties.forEach(property => {
      if (ts.isSpreadAssignment(property)) {
        const spreadValue = parseExpression(property.expression);
        if (!isPlainObject(spreadValue)) {
          throw new Error(`Spread source must be object in ${normalizedPath}: ${property.getText(sourceFile)}`);
        }
        Object.assign(result, spreadValue);
        return;
      }

      if (ts.isShorthandPropertyAssignment(property)) {
        const key = getPropertyName(property.name, sourceFile);
        const resolvedValue = resolveIdentifier(property.name.text);
        result[key] = isPlainObject(resolvedValue) ? resolvedValue : '';
        return;
      }

      if (!ts.isPropertyAssignment(property) || !property.name) {
        throw new Error(`Unsupported property syntax in i18n locale: ${property.getText(sourceFile)}`);
      }

      const key = getPropertyName(property.name, sourceFile);
      const resolvedValue = parseExpression(property.initializer);
      result[key] = isPlainObject(resolvedValue) ? resolvedValue : '';
    });

    return result;
  }

  function parseExpression(expressionNode) {
    const node = unwrapExpression(expressionNode);

    if (ts.isObjectLiteralExpression(node)) {
      return parseObjectLiteral(node);
    }

    if (ts.isIdentifier(node)) {
      return resolveIdentifier(node.text);
    }

    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateExpression(node) ||
      ts.isNumericLiteral(node) ||
      node.kind === ts.SyntaxKind.TrueKeyword ||
      node.kind === ts.SyntaxKind.FalseKeyword ||
      node.kind === ts.SyntaxKind.NullKeyword
    ) {
      return '';
    }

    // Fallback: allow non-object literal leaves and still treat them as translatable leaf nodes.
    return '';
  }

  const localeShape = parseExpression(rootExpression);
  if (!isPlainObject(localeShape)) {
    throw new Error(`Locale root must resolve to object in ${normalizedPath}`);
  }

  localeShapeCache.set(normalizedPath, localeShape);
  return localeShape;
}

function parseLocaleShape(localePath) {
  return parseLocaleShapeFromFile(localePath);
}

function compareLocaleShape(source, target) {
  /** @type {string[]} */
  const issues = [];

  function walk(sourceNode, targetNode, parent = '') {
    const sourceIsObject = isPlainObject(sourceNode);
    const targetIsObject = isPlainObject(targetNode);

    if (sourceIsObject && targetIsObject) {
      const sourceKeys = Object.keys(sourceNode);
      const targetKeys = new Set(Object.keys(targetNode));

      sourceKeys.forEach(key => {
        if (!targetKeys.has(key)) {
          issues.push(`Missing key in zh-CN: ${toPath(parent, key)}`);
        }
      });

      Object.keys(targetNode).forEach(key => {
        if (!(key in sourceNode)) {
          issues.push(`Extra key in zh-CN: ${toPath(parent, key)}`);
        }
      });

      sourceKeys.forEach(key => {
        if (key in targetNode) {
          walk(sourceNode[key], targetNode[key], toPath(parent, key));
        }
      });

      return;
    }

    if (sourceIsObject !== targetIsObject) {
      issues.push(`Type mismatch: ${parent || '<root>'}`);
      return;
    }

    if (typeof sourceNode !== 'string' || typeof targetNode !== 'string') {
      issues.push(`Leaf must be string: ${parent || '<root>'}`);
    }
  }

  walk(source, target);

  return issues;
}

function collectLeafKeys(value, parent = '', keys = []) {
  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nested]) => {
      collectLeafKeys(nested, toPath(parent, key), keys);
    });
    return keys;
  }

  keys.push(parent);
  return keys;
}

function toSchemaType(value, depth = 2) {
  if (isPlainObject(value)) {
    const indent = '  '.repeat(depth);
    const closingIndent = '  '.repeat(depth - 1);
    const lines = Object.entries(value).map(([key, nested]) => {
      return `${indent}${JSON.stringify(key)}: ${toSchemaType(nested, depth + 1)};`;
    });

    if (!lines.length) {
      return '{}';
    }

    return `{\n${lines.join('\n')}\n${closingIndent}}`;
  }

  return 'string';
}

function main() {
  const sourceLocale = parseLocaleShape(sourceLocalePath);
  const targetLocale = parseLocaleShape(targetLocalePath);

  const issues = compareLocaleShape(sourceLocale, targetLocale);
  if (issues.length > 0) {
    console.error('Locale shape mismatch detected:');
    issues.forEach(issue => console.error(`- ${issue}`));
    process.exit(1);
  }

  const i18nKeys = collectLeafKeys(sourceLocale).sort();
  const schemaType = toSchemaType(sourceLocale);
  const i18nKeyUnion = i18nKeys.length
    ? `\n${i18nKeys.map(key => `      | ${JSON.stringify(key)}`).join('\n')}`
    : ' never';

  const output = `/* eslint-disable */
/**
 * Auto-generated by \`scripts/generate-i18n-types.mjs\`.
 * Run \`pnpm i18n:types\` to regenerate.
 */
declare namespace App {
  namespace I18n {
    type GeneratedSchema = ${schemaType};

    type GeneratedI18nKey =${i18nKeyUnion};
  }
}
`;

  writeFileSync(outputPath, output, 'utf8');
  console.log(`Generated i18n types at ${outputPath}`);
}

main();
