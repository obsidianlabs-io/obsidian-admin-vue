import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { setupVitePlugins } from './build/plugins';
import { createViteProxy, getBuildTime } from './build/config';

export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as Env.ImportMeta;
  const runningInCi = process.env.CI === 'true';
  const runningPlaywright = process.env.PLAYWRIGHT === 'true';

  const buildTime = getBuildTime();

  const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview;

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: setupVitePlugins(viteEnv, buildTime),
    define: {
      BUILD_TIME: JSON.stringify(buildTime)
    },
    server: {
      host: '0.0.0.0',
      port: 9527,
      open: !runningInCi && !runningPlaywright,
      proxy: createViteProxy(viteEnv, enableProxy)
    },
    preview: {
      port: 9725
    },
    build: {
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
      commonjsOptions: {
        ignoreTryCatch: false
      },
      rollupOptions: {
        output: {
          manualChunks(id): string | undefined {
            const normalizedId = id.replace(/\\/g, '/');

            if (!normalizedId.includes('/node_modules/')) {
              return undefined;
            }

            if (/\/node_modules\/(naive-ui|@css-render|css-render)\//.test(normalizedId)) {
              return 'vendor-naive';
            }

            if (/\/node_modules\/(echarts|zrender)\//.test(normalizedId)) {
              return 'vendor-echarts';
            }

            if (/\/node_modules\/(vue|vue-router|pinia)\//.test(normalizedId)) {
              return 'vendor-vue-core';
            }

            if (/\/node_modules\/(@vueuse\/core|vue-i18n|@intlify)\//.test(normalizedId)) {
              return 'vendor-vue-ecosystem';
            }

            if (/\/node_modules\/(laravel-echo|pusher-js)\//.test(normalizedId)) {
              return 'vendor-realtime';
            }

            if (/\/node_modules\/(axios|dayjs|defu|json5)\//.test(normalizedId)) {
              return 'vendor-http-utils';
            }

            return 'vendor';
          }
        }
      }
    }
  };
});
