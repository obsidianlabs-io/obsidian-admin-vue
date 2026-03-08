import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { vue: true, unocss: true },
  {
    ignores: [
      'demo-dist/**',
      'debug-demo/**',
      '.pages-dist/**',
      'test-results/**',
      'src/service/api/generated/**',
      'src/typings/api/openapi-generated.d.ts',
      'src/typings/api/backend-generated.d.ts',
      'src/typings/i18n-generated.d.ts'
    ]
  },
  {
    files: ['packages/**/*.{js,cjs,mjs,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '~/*'],
              message: 'Workspace packages must not depend on frontend app aliases.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@sa/*/src/**'],
              message: 'Import from package public entrypoints instead of internal source paths.'
            }
          ]
        }
      ]
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'App', 'Register', '[id]', '[url]']
        }
      ],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['/^icon-/']
        }
      ],
      'unocss/order-attributify': 'off'
    }
  }
);
