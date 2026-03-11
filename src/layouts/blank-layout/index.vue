<script setup lang="ts">
defineOptions({
  name: 'BlankLayout'
});
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route.fullPath" class="min-h-screen bg-layout" />
  </RouterView>
</template>

<style scoped></style>
