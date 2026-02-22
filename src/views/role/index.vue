<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NTag } from 'naive-ui';
import { getEnableStatusLabel, getEnableStatusTagType } from '@/constants/common';
import { fetchDeleteRole, fetchGetRoleList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { createCrudActionColumn } from '@/hooks/business/crud-action-column';
import { useCrudTable } from '@/hooks/business/crud-table';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

defineOptions({
  name: 'RolePage'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const canManageRole = computed(() => hasAuth('role.manage'));
const actorRoleLevel = ref<number | null>(null);

function canManageRoleRow(row: Api.Role.RoleRecord) {
  return Boolean(row.manageable);
}

const searchParams = reactive({
  current: 1,
  size: 10,
  status: null as Api.Common.EnableStatus | null,
  keyword: null as string | null,
  level: null as number | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: async () => {
    const response = await fetchGetRoleList({
      current: searchParams.current,
      size: searchParams.size,
      status: searchParams.status ?? undefined,
      keyword: searchParams.keyword ?? undefined,
      level: searchParams.level ?? undefined
    });

    if (!response.error) {
      const level = Number(response.data?.actorLevel ?? 0);
      actorRoleLevel.value = Number.isFinite(level) && level > 0 ? level : null;
    } else {
      actorRoleLevel.value = null;
    }

    return response;
  },
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.current = params.page ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    ...(canManageRole.value
      ? [
          {
            type: 'selection' as const,
            align: 'center' as const,
            width: 48,
            disabled: (row: Api.Role.RoleRecord) => !canManageRoleRow(row)
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
      key: 'roleCode',
      title: $t('page.role.roleCode'),
      align: 'center',
      minWidth: 170,
      render: row => {
        const isReserved = row.roleCode === 'R_SUPER';

        if (!isReserved) {
          return row.roleCode;
        }

        return h(
          'div',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }
          },
          [
            h('span', row.roleCode),
            h(
              NTag,
              { type: 'warning', bordered: false, size: 'small' as const },
              { default: () => $t('page.role.systemReserved') }
            )
          ]
        );
      }
    },
    {
      key: 'roleName',
      title: $t('page.role.roleName'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'level',
      title: $t('page.role.level'),
      align: 'center',
      width: 128,
      render: row => {
        const roleLevel = Number(row.level ?? 0);
        const isSuperLevel = row.roleCode === 'R_SUPER' || roleLevel >= 900;

        return h(
          NTag,
          { type: isSuperLevel ? 'warning' : 'info', bordered: false },
          { default: () => String(roleLevel) }
        );
      }
    },
    {
      key: 'tenantName',
      title: $t('page.role.tenant'),
      align: 'center',
      minWidth: 160,
      render: row => {
        const isSuperScope = !row.tenantId;

        return h(
          NTag,
          { type: isSuperScope ? 'info' : 'default', bordered: false },
          { default: () => (isSuperScope ? $t('page.role.globalSuperadmin') : row.tenantName) }
        );
      }
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
    createCrudActionColumn<Api.Role.RoleRecord>({
      canManage: canManageRole.value,
      canEditRow: row => canManageRoleRow(row),
      canDeleteRow: row => canManageRoleRow(row),
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
  canManage: canManageRole,
  deleteById: fetchDeleteRole
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
  <TableWrapper :title="$t('route.role')">
    <template #search>
      <RoleSearch v-model:model="searchParams" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="canManageRole"
        :show-delete="canManageRole"
        :disabled-delete="!canManageRole || checkedRowKeys.length === 0"
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
      :scroll-x="1080"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :actor-role-level="actorRoleLevel"
        :read-only="viewMode || !canManageRole"
        @submitted="getDataByPage"
      />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
