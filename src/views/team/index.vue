<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchDeleteTeam, fetchGetAllOrganizations, fetchGetTeamList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { createCrudActionColumn } from '@/hooks/business/crud-action-column';
import { useCrudTable } from '@/hooks/business/crud-table';
import { useTenantChanged } from '@/hooks/business/tenant-change';
import { defaultTransform, renderEnableStatusTag, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import TeamOperateDrawer from './modules/team-operate-drawer.vue';
import TeamSearch from './modules/team-search.vue';

defineOptions({
  name: 'TeamPage'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const canManageTeam = computed(() => hasAuth('team.manage'));

const searchParams = ref({
  current: 1,
  size: 10,
  status: null as Api.Common.EnableStatus | null,
  keyword: null as string | null,
  organizationId: null as number | null
});

const organizationOptions = ref<CommonType.Option<number>[]>([]);

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetTeamList({
      current: searchParams.value.current,
      size: searchParams.value.size,
      status: searchParams.value.status ?? undefined,
      keyword: searchParams.value.keyword ?? undefined,
      organizationId: searchParams.value.organizationId ?? undefined
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page ?? 1;
    searchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    ...(canManageTeam.value
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
      key: 'teamCode',
      title: $t('page.team.teamCode'),
      align: 'center',
      minWidth: 170
    },
    {
      key: 'teamName',
      title: $t('page.team.teamName'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'organizationName',
      title: $t('page.team.organization'),
      align: 'center',
      minWidth: 170
    },
    {
      key: 'userCount',
      title: $t('page.team.users'),
      align: 'center',
      width: 90
    },
    {
      key: 'sort',
      title: $t('page.team.sort'),
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
    createCrudActionColumn<Api.Team.TeamRecord>({
      canManage: canManageTeam.value,
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
  canManage: canManageTeam,
  deleteById: fetchDeleteTeam
});

async function loadOrganizations() {
  const { data: response, error } = await fetchGetAllOrganizations();

  if (error || !response) {
    organizationOptions.value = [];
    return;
  }

  organizationOptions.value = response.records.map(item => ({
    label: `${item.organizationName} (${item.organizationCode})`,
    value: item.id
  }));
}

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

useTenantChanged(async () => {
  searchParams.value.current = 1;
  searchParams.value.organizationId = null;
  await loadOrganizations();
  getDataByPage();
});

onMounted(async () => {
  await loadOrganizations();
});
</script>

<template>
  <TableWrapper :title="$t('route.team')">
    <template #search>
      <TeamSearch v-model:model="searchParams" :organization-options="organizationOptions" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="canManageTeam"
        :show-delete="canManageTeam"
        :disabled-delete="!canManageTeam || checkedRowKeys.length === 0"
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
      :scroll-x="1180"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <TeamOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :organization-options="organizationOptions"
        :read-only="viewMode || !canManageTeam"
        @submitted="handleSubmitted"
      />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
