<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { NConfigProvider, darkTheme } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { naiveDateLocales, naiveLocales } from '@/locales/naive';

defineOptions({
  name: 'AdminAppShell'
});

const appStore = useAppStore();
const themeStore = useThemeStore();
const route = useRoute();
const AppWatermark = defineAsyncComponent(() => import('@/components/common/app-watermark.vue'));

const naiveDarkTheme = computed(() => (themeStore.darkMode ? darkTheme : undefined));
const naiveLocale = computed(() => naiveLocales[appStore.locale]);
const naiveDateLocale = computed(() => naiveDateLocales[appStore.locale]);
const showWatermark = computed(() => route.name !== 'login' && themeStore.watermark.visible);
</script>

<template>
  <NConfigProvider
    :theme="naiveDarkTheme"
    :theme-overrides="themeStore.naiveTheme"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    class="h-full"
  >
    <AppProvider>
      <RouterView class="bg-layout" />
      <AppWatermark v-if="showWatermark" />
    </AppProvider>
  </NConfigProvider>
</template>
