<script setup lang="ts">
import { computed } from 'vue';
import type { WatermarkProps } from 'naive-ui';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({
  name: 'AppWatermark'
});

const themeStore = useThemeStore();

const watermarkProps = computed<WatermarkProps>(() => {
  return {
    content: themeStore.watermarkContent,
    cross: true,
    fullscreen: true,
    fontSize: 16,
    lineHeight: 16,
    width: 384,
    height: 384,
    xOffset: 12,
    yOffset: 60,
    rotate: -15,
    zIndex: 9999
  };
});
</script>

<template>
  <NWatermark v-if="themeStore.watermark.visible" v-bind="watermarkProps" />
</template>

<style scoped></style>
