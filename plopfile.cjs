const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const process = require('node:process');

const ROOT = __dirname;
const ROUTE_EN_FILE = path.join(ROOT, 'src/locales/langs/modules/en-us/route.ts');
const ROUTE_ZH_FILE = path.join(ROOT, 'src/locales/langs/modules/zh-cn/route.ts');
const PAGE_EN_FILE = path.join(ROOT, 'src/locales/langs/modules/en-us/page.ts');
const PAGE_ZH_FILE = path.join(ROOT, 'src/locales/langs/modules/zh-cn/page.ts');
const API_INDEX_FILE = path.join(ROOT, 'src/service/api/index.ts');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toKebabCase(value) {
  return value
    .trim()
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function quoteValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseLabelPair(value, routeName) {
  const [labelEnRaw = '', labelZhRaw = ''] = String(value || '')
    .split('/')
    .map(item => item.trim());

  const fallback = routeName
    .split('-')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

  const labelEn = labelEnRaw || fallback;
  const labelZh = labelZhRaw || labelEn;

  return { labelEn, labelZh };
}

function appendTopLevelObjectEntry(options) {
  const { filePath, objectName, entryPattern, entryBlock } = options;
  const content = fs.readFileSync(filePath, 'utf8');

  if (entryPattern.test(content)) {
    return false;
  }

  const objectRegex = new RegExp(`(const\\s+${objectName}[^=]*=\\s*\\{)([\\s\\S]*?)(\\n\\};\\n?$)`, 'm');
  const match = content.match(objectRegex);

  if (!match) {
    throw new Error(`Cannot find ${objectName} block in ${filePath}`);
  }

  const separator = match[2].trimEnd().endsWith(',') ? '' : ',';
  const updated = content.replace(objectRegex, `${match[1]}${match[2]}${separator}\n${entryBlock}${match[3]}`);
  fs.writeFileSync(filePath, updated, 'utf8');

  return true;
}

function appendRouteLocale(filePath, routeKey, routeTitle) {
  return appendTopLevelObjectEntry({
    filePath,
    objectName: 'routeSection',
    entryPattern: new RegExp(`^\\s{2}${escapeRegExp(routeKey)}:\\s*`, 'm'),
    entryBlock: `  ${routeKey}: '${quoteValue(routeTitle)}',`
  });
}

function appendPageLocale(filePath, routeName, block) {
  return appendTopLevelObjectEntry({
    filePath,
    objectName: 'pageSection',
    entryPattern: new RegExp(`^\\s{2}${escapeRegExp(routeName)}:\\s*\\{`, 'm'),
    entryBlock: block
  });
}

function appendApiExport(filePath, routeName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const exportLine = `export * from './${routeName}';`;

  if (content.includes(exportLine)) {
    return false;
  }

  const lines = content.trimEnd().split('\n');
  const exportIndexes = [];

  lines.forEach((line, index) => {
    if (line.startsWith("export * from './")) {
      exportIndexes.push(index);
    }
  });

  if (!exportIndexes.length) {
    throw new Error(`Cannot find export lines in ${filePath}`);
  }

  const lastExportIndex = exportIndexes[exportIndexes.length - 1];
  lines.splice(lastExportIndex + 1, 0, exportLine);

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');

  return true;
}

function createPageLocaleBlock(data, locale) {
  const isZh = locale === 'zh';
  const label = isZh ? data.labelZh : data.labelEn;
  const addTitle = isZh ? `新增${label}` : `Add ${label}`;
  const editTitle = isZh ? `编辑${label}` : `Edit ${label}`;
  const viewTitle = isZh ? `查看${label}` : `View ${label}`;
  const codeLabel = isZh ? `${label}编码` : `${label} Code`;
  const nameLabel = isZh ? `${label}名称` : `${label} Name`;
  const codePlaceholder = isZh ? `例如：${data.codePlaceholder}` : `Ex: ${data.codePlaceholder}`;
  const namePlaceholder = isZh ? `例如：${label}` : `Ex: ${label}`;
  const scaffoldNotice = isZh
    ? `这是通过 pnpm generate:page 生成的 scaffold。接入真实 generated SDK 后再开放生产使用。`
    : `This page was scaffolded with pnpm generate:page. Wire the real generated SDK before using it in production.`;

  return [
    `  ${data.routeName}: {`,
    `    addTitle: '${quoteValue(addTitle)}',`,
    `    editTitle: '${quoteValue(editTitle)}',`,
    `    viewTitle: '${quoteValue(viewTitle)}',`,
    `    ${data.codeKey}: '${quoteValue(codeLabel)}',`,
    `    ${data.nameKey}: '${quoteValue(nameLabel)}',`,
    `    ${data.codeKey}Placeholder: '${quoteValue(codePlaceholder)}',`,
    `    ${data.nameKey}Placeholder: '${quoteValue(namePlaceholder)}',`,
    `    scaffoldNotice: '${quoteValue(scaffoldNotice)}'`,
    '  },'
  ].join('\n');
}

module.exports = plop => {
  plop.setGenerator('page', {
    description: 'Generate a code/name/status CRUD scaffold with i18n, facade, and VTU test',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource key (singular, kebab-case. e.g. product):',
        validate: value => (value && value.trim().length > 0 ? true : 'Resource key is required')
      },
      {
        type: 'input',
        name: 'labels',
        message: 'Labels (English / Chinese. e.g. Product / 产品):',
        validate: value => (String(value || '').trim().length > 0 ? true : 'Labels are required')
      }
    ],
    actions: answers => {
      const routeName = toKebabCase(answers.name);
      const pascalName = plop.getHelper('pascalCase')(routeName);
      const camelName = plop.getHelper('camelCase')(routeName);
      const { labelEn, labelZh } = parseLabelPair(answers.labels, routeName);
      const codeKey = `${camelName}Code`;
      const nameKey = `${camelName}Name`;
      const codePlaceholder = `${routeName.toUpperCase().replace(/-/g, '_')}_MAIN`;
      const data = {
        routeName,
        pascalName,
        camelName,
        labelEn,
        labelZh,
        codeKey,
        nameKey,
        codePlaceholder
      };
      const generatedFiles = [
        `src/views/${routeName}/index.vue`,
        `src/views/${routeName}/modules/${routeName}-search.vue`,
        `src/views/${routeName}/modules/${routeName}-operate-drawer.vue`,
        `src/typings/api/${routeName}.d.ts`,
        `src/service/api/${routeName}.ts`,
        `tests/vue/${routeName}-operate-drawer.spec.ts`,
        'src/locales/langs/modules/en-us/route.ts',
        'src/locales/langs/modules/zh-cn/route.ts',
        'src/locales/langs/modules/en-us/page.ts',
        'src/locales/langs/modules/zh-cn/page.ts',
        'src/service/api/index.ts'
      ];

      const actions = [
        {
          type: 'add',
          path: 'src/views/{{routeName}}/index.vue',
          templateFile: 'plop-templates/page/index.vue.hbs',
          data,
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/views/{{routeName}}/modules/{{routeName}}-search.vue',
          templateFile: 'plop-templates/page/search.vue.hbs',
          data,
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/views/{{routeName}}/modules/{{routeName}}-operate-drawer.vue',
          templateFile: 'plop-templates/page/operate-drawer.vue.hbs',
          data,
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/typings/api/{{routeName}}.d.ts',
          templateFile: 'plop-templates/page/api.d.ts.hbs',
          data,
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'src/service/api/{{routeName}}.ts',
          templateFile: 'plop-templates/page/api.ts.hbs',
          data,
          skipIfExists: true
        },
        {
          type: 'add',
          path: 'tests/vue/{{routeName}}-operate-drawer.spec.ts',
          templateFile: 'plop-templates/page/operate-drawer.spec.ts.hbs',
          data,
          skipIfExists: true
        },
        () => {
          const changed = [
            appendRouteLocale(ROUTE_EN_FILE, routeName, labelEn),
            appendRouteLocale(ROUTE_ZH_FILE, routeName, labelZh),
            appendPageLocale(PAGE_EN_FILE, routeName, createPageLocaleBlock(data, 'en')),
            appendPageLocale(PAGE_ZH_FILE, routeName, createPageLocaleBlock(data, 'zh')),
            appendApiExport(API_INDEX_FILE, routeName)
          ].some(Boolean);

          return changed
            ? `Scaffold metadata added for ${routeName}`
            : `Scaffold metadata already exists for ${routeName}`;
        }
      ];

      if (process.env.PLOP_SKIP_POST_GEN !== '1') {
        actions.push(() => {
          execSync('pnpm i18n:types', {
            cwd: ROOT,
            stdio: 'inherit'
          });
          execSync(`pnpm exec eslint --fix ${generatedFiles.join(' ')}`, {
            cwd: ROOT,
            stdio: 'inherit'
          });

          return 'i18n typings regenerated and scaffold files lint-fixed';
        });
      }

      return actions;
    }
  });
};
