<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { isDemoRuntime } from '@/utils/runtime';
import DemoGuestShell from './app-shells/demo-guest-shell.vue';

defineOptions({
  name: 'App'
});

const route = useRoute();
const demoRuntime = isDemoRuntime(import.meta.env);
const guestRouteNames = new Set(['login', '403', '404', '500']);

const ManagedGuestShell = defineAsyncComponent(() => import('./app-shells/managed-guest-shell.vue'));
const AdminAppShell = defineAsyncComponent(() => import('./app-shells/admin-app-shell.vue'));

const activeShell = computed(() => {
  const routeName = String(route.name || '');
  const isGuestRoute = guestRouteNames.has(routeName);

  if (isGuestRoute && demoRuntime) {
    return DemoGuestShell;
  }

  if (isGuestRoute) {
    return ManagedGuestShell;
  }

  return AdminAppShell;
});
</script>

<template>
  <component :is="activeShell" />
</template>
