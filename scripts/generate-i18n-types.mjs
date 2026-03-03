import { readFileSync, writeFileSync } from 'node:fs';
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

function parseLocaleShape(localePath) {
  const content = readFileSync(localePath, 'utf8');
  const sourceFile = ts.createSourceFile(localePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  let localeObject = null;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'local' &&
      node.initializer
    ) {
      if (!ts.isObjectLiteralExpression(node.initializer)) {
        throw new Error(`Expected "local" to be an object literal in ${localePath}`);
      }
      localeObject = node.initializer;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (!localeObject) {
    throw new Error(`Cannot find "local" locale object in ${localePath}`);
  }

  function parseObjectLiteral(objectLiteral) {
    const result = {};

    objectLiteral.properties.forEach(property => {
      if (ts.isSpreadAssignment(property)) {
        throw new Error(`Spread syntax is not supported in i18n locale: ${property.getText(sourceFile)}`);
      }

      if (!ts.isPropertyAssignment(property) || !property.name) {
        throw new Error(`Unsupported property syntax in i18n locale: ${property.getText(sourceFile)}`);
      }

      const key = getPropertyName(property.name, sourceFile);
      const valueNode = property.initializer;

      if (ts.isObjectLiteralExpression(valueNode)) {
        result[key] = parseObjectLiteral(valueNode);
        return;
      }

      if (
        ts.isStringLiteral(valueNode) ||
        ts.isNoSubstitutionTemplateLiteral(valueNode) ||
        ts.isTemplateExpression(valueNode)
      ) {
        result[key] = '';
        return;
      }

      // Fallback: allow non-object literal leaves and still treat them as translatable leaf nodes.
      result[key] = '';
    });

    return result;
  }

  return parseObjectLiteral(localeObject);
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
