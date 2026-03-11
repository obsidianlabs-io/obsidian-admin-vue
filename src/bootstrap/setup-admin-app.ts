import { createApp } from 'vue';
import { setupVueRootValidator } from 'vite-plugin-vue-transition-root-validator/client';
import { setupLoading } from '@/plugins/loading';
import { setupNProgress } from '@/plugins/nprogress';
import { setupIconifyOffline } from '@/plugins/iconify';
import { setupDayjs } from '@/plugins/dayjs';
import { setupAppVersionNotification } from '@/plugins/app';
import { setupRouter } from '@/router';
import { setupStore } from '@/store';
import App from '@/App.vue';
import { getLocale, setLocale, setupI18n } from '@/locales';
import { hydrateDefaultLocale, resolvePreferredLocale } from '@/locales/default-locale';
import { setActiveBootstrapMode } from './runtime-state';

export async function setupAdminApp() {
  setupLoading();

  await hydrateDefaultLocale();
  setLocale(resolvePreferredLocale());

  setupNProgress();
  setupIconifyOffline();
  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  await setupRouter(app);
  await setupI18n(app, { loadFullMessages: true });

  setupAppVersionNotification();

  setActiveBootstrapMode('admin');

  setupVueRootValidator(app, {
    lang: getLocale() === 'zh-CN' ? 'zh' : 'en'
  });

  app.mount('#app');
}
