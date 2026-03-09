<script setup lang="ts">
import { computed, ref } from 'vue';
import { fetchDeleteOrganization, fetchGetOrganizationList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { createCrudActionColumn } from '@/hooks/business/crud-action-column';
import { useCrudTable } from '@/hooks/business/crud-table';
import { useTenantChanged } from '@/hooks/business/tenant-change';
import { defaultTransform, renderEnableStatusTag, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import OrganizationOperateDrawer from './modules/organization-operate-drawer.vue';
import OrganizationSearch from './modules/organization-search.vue';

defineOptions({
  name: 'OrganizationPage'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const canManageOrganization = computed(() => hasAuth('organization.manage'));

const searchParams = ref({
  current: 1,
  size: 10,
  status: null as Api.Common.EnableStatus | null,
  keyword: null as string | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetOrganizationList({
      current: searchParams.value.current,
      size: searchParams.value.size,
      status: searchParams.value.status ?? undefined,
      keyword: searchParams.value.keyword ?? undefined
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page ?? 1;
    searchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    ...(canManageOrganization.value
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
      render: (_, index) => (searchParams.value.current - 1) * searchParams.value.size + index + 1
    },
    {
      key: 'organizationCode',
      title: $t('page.organization.organizationCode'),
      align: 'center',
      minWidth: 170
    },
    {
      key: 'organizationName',
      title: $t('page.organization.organizationName'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'teamCount',
      title: $t('page.organization.teams'),
      align: 'center',
      width: 90
    },
    {
      key: 'userCount',
      title: $t('page.organization.users'),
      align: 'center',
      width: 90
    },
    {
      key: 'sort',
      title: $t('page.organization.sort'),
      align: 'center',
      width: 90
    },
    {
      key: 'status',
      title: $t('common.status'),
      align: 'center',
      width: 110,
      render: row => renderEnableStatusTag(row.status)
    },
    {
      key: 'updateTime',
      title: $t('common.updatedAt'),
      align: 'center',
      width: 180
    },
    createCrudActionColumn<Api.Organization.OrganizationRecord>({
      canManage: canManageOrganization.value,
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
  canManage: canManageOrganization,
  deleteById: fetchDeleteOrganization
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
  searchParams.value.current = 1;
  getDataByPage();
}

function handleSubmitted() {
  getDataByPage();
}

useTenantChanged(() => {
  searchParams.value.current = 1;
  getDataByPage();
});
</script>

<template>
  <TableWrapper :title="$t('route.organization')">
    <template #search>
      <OrganizationSearch v-model:model="searchParams" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="canManageOrganization"
        :show-delete="canManageOrganization"
        :disabled-delete="!canManageOrganization || checkedRowKeys.length === 0"
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
      :scroll-x="1120"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <OrganizationOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :read-only="viewMode || !canManageOrganization"
        @submitted="handleSubmitted"
      />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
