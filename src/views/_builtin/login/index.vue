<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { isDemoRuntime } from '@/utils/runtime';
import DemoLoginPage from './pages/demo-login-page.vue';
import LoginLoadingShell from './pages/login-loading-shell.vue';

const demoRuntime = isDemoRuntime(import.meta.env);

const BackendLoginPage = defineAsyncComponent({
  loader: () => import('./pages/backend-login-page.vue'),
  loadingComponent: LoginLoadingShell,
  delay: 0,
  suspensible: false
});

interface Props {
  module?: UnionKey.LoginModule;
}

const props = defineProps<Props>();
const runtimePage = computed(() => (demoRuntime ? DemoLoginPage : BackendLoginPage));
</script>

<template>
  <component :is="runtimePage" :module="props.module" />
</template>
