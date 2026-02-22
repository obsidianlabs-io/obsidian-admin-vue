<script setup lang="ts">
import { computed, h, reactive } from 'vue';
import { NTag } from 'naive-ui';
import { getEnableStatusLabel, getEnableStatusTagType } from '@/constants/common';
import { fetchDeletePermission, fetchGetPermissionList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { createCrudActionColumn } from '@/hooks/business/crud-action-column';
import { useCrudTable } from '@/hooks/business/crud-table';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import PermissionOperateDrawer from './modules/permission-operate-drawer.vue';
import PermissionSearch from './modules/permission-search.vue';

defineOptions({
  name: 'PermissionPage'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const canManagePermission = computed(() => hasAuth('permission.manage'));

const searchParams = reactive({
  current: 1,
  size: 10,
  status: null as Api.Common.EnableStatus | null,
  keyword: null as string | null,
  group: null as string | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetPermissionList({
      current: searchParams.current,
      size: searchParams.size,
      status: searchParams.status ?? undefined,
      keyword: searchParams.keyword ?? undefined,
      group: searchParams.group ?? undefined
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.current = params.page ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    ...(canManagePermission.value
      ? [
          {
            type: 'selection' as const,
            align: 'center' as const,
            width: 48
          }
        ]
      : []),
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => (searchParams.current - 1) * searchParams.size + index + 1
    },
    {
      key: 'permissionCode',
      title: $t('page.permission.permissionCode'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'permissionName',
      title: $t('page.permission.permissionName'),
      align: 'center',
      minWidth: 160
    },
    {
      key: 'group',
      title: $t('page.permission.group'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('common.status'),
      align: 'center',
      width: 110,
      render: row => {
        return h(
          NTag,
          { type: getEnableStatusTagType(row.status) },
          { default: () => getEnableStatusLabel(row.status) }
        );
      }
    },
    {
      key: 'updateTime',
      title: $t('common.updatedAt'),
      align: 'center',
      width: 180
    },
    createCrudActionColumn<Api.Permission.PermissionRecord>({
      canManage: canManagePermission.value,
      onView: row => view(row.id),
      onEdit: row => edit(row.id),
      onDelete: row => handleDelete(row.id)
    })
  ]
});

const {
  viewMode,
  drawerVisible,
  operateType,
  editingData,
  checkedRowKeys,
  add: crudAdd,
  edit: crudEdit,
  view: crudView,
  handleDelete: crudHandleDelete,
  handleBatchDelete: crudHandleBatchDelete
} = useCrudTable({
  data,
  idKey: 'id',
  getData,
  canManage: canManagePermission,
  deleteById: fetchDeletePermission
});

function add() {
  crudAdd();
}

function edit(id: number) {
  crudEdit(id);
}

function view(id: number) {
  crudView(id);
}

async function handleDelete(id: number) {
  await crudHandleDelete(id);
}

async function handleBatchDelete() {
  await crudHandleBatchDelete();
}

function handleSearch() {
  searchParams.current = 1;
  getDataByPage();
}
</script>

<template>
  <TableWrapper :title="$t('route.permission')">
    <template #search>
      <PermissionSearch v-model:model="searchParams" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="canManagePermission"
        :show-delete="canManagePermission"
        :disabled-delete="!canManagePermission || checkedRowKeys.length === 0"
        :loading="loading"
        @add="add"
        @delete="handleBatchDelete"
        @refresh="getData"
      />
    </template>
    <NDataTable
      v-model:checked-row-keys="checkedRowKeys"
      size="small"
      class="sm:h-full"
      remote
      :columns="columns"
      :data="data"
      :loading="loading"
      :flex-height="!appStore.isMobile"
      :scroll-x="1200"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <PermissionOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :read-only="viewMode || !canManagePermission"
        @submitted="getDataByPage"
      />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
