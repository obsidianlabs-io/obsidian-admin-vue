<script setup lang="ts">
import type { PaginationProps } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import type { SchemaSearchField } from '@/types/schema-search-form';

type TableRowKey = string | number;

defineOptions({
  name: 'DynamicCrudView'
});

interface Props {
  title: string;
  searchFields: SchemaSearchField<any>[];
  columns: NaiveUI.TableColumn<any>[];
  data: any[];
  loading: boolean;
  rowKey: (row: any) => TableRowKey;
  pagination: PaginationProps;
  scrollX?: number;
  showAdd?: boolean;
  showDelete?: boolean;
  deleteDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  scrollX: 1200,
  showAdd: true,
  showDelete: true,
  deleteDisabled: true
});

interface Emits {
  (e: 'search'): void;
  (e: 'refresh'): void;
  (e: 'add'): void;
  (e: 'delete'): void;
}

defineEmits<Emits>();

const appStore = useAppStore();

const columnChecks = defineModel<NaiveUI.TableColumnCheck[]>('columnChecks', {
  required: true
});
const checkedRowKeys = defineModel<TableRowKey[]>('checkedRowKeys', {
  default: () => []
});
const searchModel = defineModel<Record<string, any>>('searchModel', {
  required: true
});
</script>

<template>
  <TableWrapper :title="props.title">
    <template #search>
      <SchemaSearchForm v-model:model="searchModel" :fields="props.searchFields" @search="() => $emit('search')" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="props.showAdd"
        :show-delete="props.showDelete"
        :disabled-delete="props.deleteDisabled"
        :loading="props.loading"
        @add="() => $emit('add')"
        @delete="() => $emit('delete')"
        @refresh="() => $emit('refresh')"
      />
    </template>

    <NDataTable
      v-model:checked-row-keys="checkedRowKeys"
      size="small"
      class="sm:h-full"
      remote
      :columns="props.columns"
      :data="props.data"
      :loading="props.loading"
      :flex-height="!appStore.isMobile"
      :scroll-x="props.scrollX"
      :row-key="props.rowKey"
      :pagination="props.pagination"
    />

    <template #operate>
      <slot name="operate" />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
