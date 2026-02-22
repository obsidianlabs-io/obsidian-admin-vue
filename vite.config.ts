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
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('naive-ui')) {
              return 'vendor-naive';
            }

            if (id.includes('echarts')) {
              return 'vendor-echarts';
            }

            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router') || id.includes('@vueuse')) {
              return 'vendor-vue';
            }

            return 'vendor';
          }
        }
      }
    }
  };
});
