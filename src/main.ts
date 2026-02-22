import { createApp } from 'vue';
import './plugins/assets';
import { setupVueRootValidator } from 'vite-plugin-vue-transition-root-validator/client';
import { setupAppVersionNotification, setupDayjs, setupIconifyOffline, setupLoading, setupNProgress } from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { getLocale, setLocale, setupI18n } from './locales';
import { hydrateDefaultLocale, resolvePreferredLocale } from './locales/default-locale';
import App from './App.vue';

async function setupApp() {
  setupLoading();

  await hydrateDefaultLocale();
  setLocale(resolvePreferredLocale());

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  await setupRouter(app);

  await setupI18n(app);

  setupAppVersionNotification();

  setupVueRootValidator(app, {
    lang: getLocale() === 'zh-CN' ? 'zh' : 'en'
  });

  app.mount('#app');
}

setupApp();
