<script setup lang="ts">
import { computed } from 'vue';
import { NConfigProvider } from 'naive-ui';
import { naiveDateLocales, naiveLocales } from '@/locales/naive';
import { resolvePreferredLocale } from '@/locales/default-locale';

defineOptions({
  name: 'DemoGuestShell'
});

const locale = resolvePreferredLocale();
const naiveLocale = computed(() => naiveLocales[locale]);
const naiveDateLocale = computed(() => naiveDateLocales[locale]);
</script>

<template>
  <NConfigProvider :locale="naiveLocale" :date-locale="naiveDateLocale" class="h-full">
    <AppProvider>
      <RouterView class="bg-layout" />
    </AppProvider>
  </NConfigProvider>
</template>
