<script setup lang="ts">
import { computed, h, reactive } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { getEnableStatusLabel, getEnableStatusTagType } from '@/constants/common';
import { fetchDeleteTenant, fetchGetTenantList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { useCrudTable } from '@/hooks/business/crud-table';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import TenantOperateDrawer from './modules/tenant-operate-drawer.vue';
import TenantSearch from './modules/tenant-search.vue';

defineOptions({
  name: 'TenantPage'
});

const appStore = useAppStore();
const authStore = useAuthStore();
const { hasAuth } = useAuth();
const canManageTenant = computed(() => hasAuth('tenant.manage'));

const searchParams = reactive({
  current: 1,
  size: 10,
  status: null as Api.Common.EnableStatus | null,
  keyword: null as string | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetTenantList({
      current: searchParams.current,
      size: searchParams.size,
      status: searchParams.status ?? undefined,
      keyword: searchParams.keyword ?? undefined
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.current = params.page ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    ...(canManageTenant.value
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
      key: 'tenantCode',
      title: $t('page.tenant.tenantCode'),
      align: 'center',
      minWidth: 160
    },
    {
      key: 'tenantName',
      title: $t('page.tenant.tenantName'),
      align: 'center',
      minWidth: 180
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
      key: 'userCount',
      title: $t('page.tenant.users'),
      align: 'center',
      width: 90
    },
    {
      key: 'updateTime',
      title: $t('common.updatedAt'),
      align: 'center',
      width: 180
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: canManageTenant.value ? 220 : 96,
      fixed: 'right',
      render: row => {
        const viewButton = h(
          NButton,
          {
            type: 'default',
            ghost: true,
            size: 'small',
            onClick: () => view(row.id)
          },
          { default: () => $t('common.view') }
        );

        if (!canManageTenant.value) {
          return h('div', { class: 'flex-center gap-8px' }, [viewButton]);
        }

        return h('div', { class: 'flex-center gap-8px' }, [
          viewButton,
          h(
            NButton,
            {
              type: 'primary',
              ghost: true,
              size: 'small',
              onClick: () => edit(row.id)
            },
            { default: () => $t('common.edit') }
          ),
          h(
            NPopconfirm,
            { onPositiveClick: () => handleDelete(row.id) },
            {
              default: () => $t('common.confirmDelete'),
              trigger: () =>
                h(
                  NButton,
                  {
                    type: 'error',
                    ghost: true,
                    size: 'small'
                  },
                  { default: () => $t('common.delete') }
                )
            }
          )
        ]);
      }
    }
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
  canManage: canManageTenant,
  deleteById: fetchDeleteTenant,
  onAfterDeleteSuccess: async () => {
    await authStore.initUserInfo();
  }
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

async function handleSubmitted() {
  getDataByPage();
  await authStore.initUserInfo();
}
</script>

<template>
  <TableWrapper :title="$t('route.tenant')">
    <template #search>
      <TenantSearch v-model:model="searchParams" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="canManageTenant"
        :show-delete="canManageTenant"
        :disabled-delete="!canManageTenant || checkedRowKeys.length === 0"
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
      :scroll-x="980"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <TenantOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :read-only="viewMode || !canManageTenant"
        @submitted="handleSubmitted"
      />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
