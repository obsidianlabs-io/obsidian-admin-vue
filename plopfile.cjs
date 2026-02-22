const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = __dirname;
const EN_LOCALE_FILE = path.join(ROOT, 'src/locales/langs/en-us.ts');
const ZH_LOCALE_FILE = path.join(ROOT, 'src/locales/langs/zh-cn.ts');
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

function appendRouteLocale(filePath, routeKey, routeTitle) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keyRegex = new RegExp(`['"]${escapeRegExp(routeKey)}['"]\\s*:`);

  if (keyRegex.test(content)) {
    return false;
  }

  const routeBlockRegex = /(\n\s{2}route:\s\{)([\s\S]*?)(\n\s{2}\},\n\s{2}menu:)/m;
  const match = content.match(routeBlockRegex);

  if (!match) {
    throw new Error(`Cannot find route block in ${filePath}`);
  }

  const routeLine = `    '${routeKey}': '${quoteValue(routeTitle)}',`;
  const updated = content.replace(routeBlockRegex, `${match[1]}${match[2]}\n${routeLine}${match[3]}`);

  fs.writeFileSync(filePath, updated, 'utf8');

  return true;
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

module.exports = plop => {
  plop.setGenerator('page', {
    description: 'Generate a new page + locale route keys + typed API placeholders',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name (e.g. products):',
        validate: value => (value && value.trim().length > 0 ? true : 'Page name is required')
      },
      {
        type: 'input',
        name: 'titleEn',
        message: 'English route title:',
        default: answers => answers.name
      },
      {
        type: 'input',
        name: 'titleZh',
        message: 'Chinese route title:',
        default: answers => answers.name
      },
      {
        type: 'confirm',
        name: 'withApi',
        message: 'Generate typed API placeholder files?',
        default: true
      },
      {
        type: 'confirm',
        name: 'runRouteGen',
        message: 'Run pnpm gen-route after scaffold?',
        default: true
      }
    ],
    actions: answers => {
      const routeName = toKebabCase(answers.name);
      const pascalName = plop.getHelper('pascalCase')(routeName);

      const actions = [
        {
          type: 'add',
          path: 'src/views/{{routeName}}/index.vue',
          templateFile: 'plop-templates/page/index.vue.hbs',
          data: { routeName, pascalName },
          skipIfExists: true
        },
        () => {
          const changedEn = appendRouteLocale(EN_LOCALE_FILE, routeName, answers.titleEn);
          const changedZh = appendRouteLocale(ZH_LOCALE_FILE, routeName, answers.titleZh);
          return changedEn || changedZh
            ? `Route i18n keys added for ${routeName}`
            : `Route i18n keys already exist for ${routeName}`;
        }
      ];

      if (answers.withApi) {
        actions.push(
          {
            type: 'add',
            path: 'src/typings/api/{{routeName}}.d.ts',
            templateFile: 'plop-templates/page/api.d.ts.hbs',
            data: { routeName, pascalName },
            skipIfExists: true
          },
          {
            type: 'add',
            path: 'src/service/api/{{routeName}}.ts',
            templateFile: 'plop-templates/page/api.ts.hbs',
            data: { routeName, pascalName },
            skipIfExists: true
          },
          () => {
            const changed = appendApiExport(API_INDEX_FILE, routeName);
            return changed
              ? `API index export added for ${routeName}`
              : `API index export already exists for ${routeName}`;
          }
        );
      }

      if (answers.runRouteGen) {
        actions.push(() => {
          execSync('pnpm gen-route', {
            cwd: ROOT,
            stdio: 'inherit'
          });

          return 'Route manifest regenerated via pnpm gen-route';
        });
      }

      return actions.map(action => {
        if (typeof action === 'object' && action.data === undefined) {
          return { ...action, data: { routeName, pascalName } };
        }

        return action;
      });
    }
  });
};
