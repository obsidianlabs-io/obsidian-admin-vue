import { createApp } from 'vue';
import { setupVueRootValidator } from 'vite-plugin-vue-transition-root-validator/client';
import { setupLoading } from '@/plugins/loading';
import { setupNProgress } from '@/plugins/nprogress';
import { setupIconifyOffline } from '@/plugins/iconify';
import { setupStore } from '@/store';
import App from '@/App.vue';
import { getLocale, setLocale, setupI18n } from '@/locales';
import { hydrateDefaultLocale, resolvePreferredLocale } from '@/locales/default-locale';
import { setupGuestRouter } from '@/router/guest';
import { setActiveBootstrapMode } from './runtime-state';

export async function setupGuestApp() {
  setupLoading();

  await hydrateDefaultLocale();
  setLocale(resolvePreferredLocale());

  setupNProgress();
  setupIconifyOffline();

  const app = createApp(App);

  setupStore(app);

  await setupGuestRouter(app);
  await setupI18n(app);

  setActiveBootstrapMode('guest');

  setupVueRootValidator(app, {
    lang: getLocale() === 'zh-CN' ? 'zh' : 'en'
  });

  app.mount('#app');
}
