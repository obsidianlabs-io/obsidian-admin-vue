<script setup lang="ts">
defineOptions({
  name: 'TableWrapper'
});

interface Props {
  /** The title of the card/table */
  title?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-x-hidden overflow-y-auto">
    <!-- Search Form Slot -->
    <slot name="search"></slot>

    <!-- Main Table Card -->
    <NCard :title="title" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <!-- Table Header Actions (e.g. Add, Batch Delete) -->
        <slot name="header-extra"></slot>
      </template>

      <!-- Main Data Table Container -->
      <slot></slot>

      <!-- Drawers / Modals via operate slot -->
      <slot name="operate"></slot>
    </NCard>
  </div>
</template>

<style scoped></style>
