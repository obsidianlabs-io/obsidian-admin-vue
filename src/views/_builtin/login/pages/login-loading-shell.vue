<script setup lang="ts">
defineOptions({
  name: 'LoginLoadingShell'
});
</script>

<template>
  <div class="relative min-h-screen flex-center overflow-hidden bg-[#f4f7fb] px-16px py-32px">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%)]"></div>
    <NCard :bordered="false" class="relative z-1 max-w-full w-400px rd-16px">
      <div class="flex flex-col items-center gap-16px py-24px">
        <SystemLogo class="size-64px" />
        <div class="text-center">
          <h1 class="text-28px text-primary font-600">Obsidian Admin</h1>
          <p class="mt-8px text-14px text-[#64748b]">Loading preview shell...</p>
        </div>
        <div class="h-4px w-160px overflow-hidden rounded-full bg-[#e2e8f0]">
          <div class="preview-loading-bar h-full w-40% rounded-full bg-primary"></div>
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.preview-loading-bar {
  animation: preview-loading-slide 1.1s ease-in-out infinite;
}

@keyframes preview-loading-slide {
  0%,
  100% {
    transform: translateX(-55%);
  }

  50% {
    transform: translateX(145%);
  }
}
</style>
