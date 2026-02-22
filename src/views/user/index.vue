<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NTag, NTooltip } from 'naive-ui';
import { getEnableStatusLabel, getEnableStatusTagType } from '@/constants/common';
import { fetchDeleteUser, fetchGetUserList } from '@/service/api';
import { useAuth } from '@/hooks/business/auth';
import { useCrudSchema } from '@/hooks/business/crud-schema';
import { createCrudActionColumn } from '@/hooks/business/crud-action-column';
import { useCrudTable } from '@/hooks/business/crud-table';
import { useCrudPaginatedTable } from '@/hooks/business/crud-paginated-table';
import { useTenantChanged } from '@/hooks/business/tenant-change';
import { $t } from '@/locales';
import DynamicCrudView from '@/components/advanced/dynamic-crud-view.vue';
import UserOperateDrawer from './modules/user-operate-drawer.vue';

defineOptions({
  name: 'UserList'
});

const { hasAuth } = useAuth();
const canManageUser = computed(() => hasAuth('user.manage'));
const actorRoleLevel = ref<number | null>(null);

function canManageUserRow(row: Api.User.UserRecord) {
  return Boolean(row.manageable);
}

function getUserManageDisabledTooltip(row: Api.User.UserRecord) {
  if (row.manageable !== false) {
    return null;
  }

  const currentLevel = actorRoleLevel.value;
  const targetLevel = Number(row.roleLevel ?? 0);

  if (currentLevel && targetLevel > 0) {
    return $t('page.user.manageLevelRestrictionWithLevels', {
      current: String(currentLevel),
      target: String(targetLevel)
    });
  }

  return $t('page.user.manageLevelRestriction');
}

const fallbackUserSchema: Api.CrudSchema.Schema = {
  resource: 'user',
  permission: 'user.view',
  searchFields: [
    {
      key: 'userName',
      type: 'input',
      labelKey: 'page.user.userName',
      placeholderKey: 'page.user.userNamePlaceholder'
    },
    {
      key: 'userEmail',
      type: 'input',
      labelKey: 'common.email',
      placeholderKey: 'page.user.emailPlaceholder'
    },
    {
      key: 'roleCode',
      type: 'select',
      labelKey: 'common.role',
      placeholderKey: 'common.selectRole',
      optionSource: 'role.all',
      filterable: true
    },
    {
      key: 'status',
      type: 'select',
      labelKey: 'common.status',
      placeholderKey: 'common.selectStatus',
      optionSource: 'status.enable'
    }
  ],
  columns: [
    {
      key: 'index',
      type: 'index',
      titleKey: 'common.index',
      align: 'center',
      width: 64
    },
    {
      key: 'userName',
      type: 'text',
      titleKey: 'page.user.userName',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'email',
      type: 'text',
      titleKey: 'common.email',
      align: 'center',
      minWidth: 220
    },
    {
      key: 'roleName',
      type: 'text',
      titleKey: 'common.role',
      align: 'center',
      minWidth: 140,
      emptyLabelKey: 'common.noData'
    },
    {
      key: 'status',
      type: 'status',
      titleKey: 'common.status',
      align: 'center',
      width: 120
    },
    {
      key: 'createTime',
      type: 'datetime',
      titleKey: 'common.createdAt',
      align: 'center',
      width: 180
    },
    {
      key: 'updateTime',
      type: 'datetime',
      titleKey: 'common.updatedAt',
      align: 'center',
      width: 180
    }
  ],
  scrollX: 1300
};

const {
  loading: schemaLoading,
  schema,
  searchFields,
  loadAll: loadCrudSchema,
  loadRoleOptions
} = useCrudSchema({
  resource: 'user',
  fallbackSchema: fallbackUserSchema
});

type UserSearchParams = {
  current: number;
  size: number;
  status: Api.Common.EnableStatus | null;
  roleCode: string | null;
  userName: string | null;
  userEmail: string | null;
};

const searchParams = reactive<UserSearchParams>({
  current: 1,
  size: 10,
  status: null,
  roleCode: null,
  userName: null,
  userEmail: null
});

const schemaColumns = computed<NaiveUI.TableColumn<Api.User.UserRecord>[]>(() => {
  return schema.value.columns.map(column => {
    if (column.type === 'index') {
      return {
        key: column.key,
        title: $t(column.titleKey),
        align: column.align,
        width: column.width,
        render: (_row, index) => (searchParams.current - 1) * searchParams.size + index + 1
      };
    }

    if (column.type === 'status') {
      return {
        key: column.key,
        title: $t(column.titleKey),
        align: column.align,
        width: column.width,
        render: row => {
          if (row.status === null) {
            return null;
          }

          return h(
            NTag,
            { type: getEnableStatusTagType(row.status) },
            { default: () => getEnableStatusLabel(row.status) }
          );
        }
      };
    }

    if (column.key === 'roleName') {
      return {
        key: column.key,
        title: $t(column.titleKey),
        align: column.align,
        width: column.width,
        minWidth: column.minWidth,
        render: row => {
          const roleName = row.roleName || $t(column.emptyLabelKey || 'common.noData');

          if (!(canManageUser.value && row.manageable === false)) {
            return roleName;
          }

          const tooltip = getUserManageDisabledTooltip(row) || $t('page.user.manageLevelRestriction');

          return h(
            'div',
            {
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }
            },
            [
              h('span', roleName),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NTag,
                      { type: 'warning', bordered: false, size: 'small' as const },
                      { default: () => $t('page.user.manageRestrictedBadge') }
                    ),
                  default: () => tooltip
                }
              )
            ]
          );
        }
      };
    }

    return {
      key: column.key,
      title: $t(column.titleKey),
      align: column.align,
      width: column.width,
      minWidth: column.minWidth
    };
  });
});

const tableScrollX = computed(() => schema.value.scrollX || 1300);

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  tableLoading: dataLoading,
  mobilePagination,
  search: searchData
} = useCrudPaginatedTable<Api.User.UserRecord, UserSearchParams>({
  searchParams,
  api: async params => {
    const response = await fetchGetUserList(params as Api.User.UserListParams);

    if (!response.error) {
      const level = Number(response.data?.actorLevel ?? 0);
      actorRoleLevel.value = Number.isFinite(level) && level > 0 ? level : null;
    } else {
      actorRoleLevel.value = null;
    }

    return response;
  },
  immediate: false,
  columns: () => [
    ...(canManageUser.value
      ? [
          {
            type: 'selection' as const,
            align: 'center' as const,
            width: 48,
            disabled: (row: Api.User.UserRecord) => !canManageUserRow(row)
          }
        ]
      : []),
    ...schemaColumns.value,
    createCrudActionColumn<Api.User.UserRecord>({
      canManage: canManageUser.value,
      canEditRow: row => canManageUserRow(row),
      canDeleteRow: row => canManageUserRow(row),
      getEditDisabledTooltip: row => getUserManageDisabledTooltip(row),
      getDeleteDisabledTooltip: row => getUserManageDisabledTooltip(row),
      onView: onViewRow,
      onEdit: onEditRow,
      onDelete: onDeleteRow
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
  canManage: canManageUser,
  deleteById: fetchDeleteUser
});

const tableLoading = computed(() => dataLoading.value || schemaLoading.value);

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
  searchData();
}

function resetSearchParamsForTenantChange() {
  searchParams.current = 1;
  searchParams.status = null;
  searchParams.roleCode = null;
  searchParams.userName = null;
  searchParams.userEmail = null;
}

function handleTenantChanged() {
  resetSearchParamsForTenantChange();
  checkedRowKeys.value = [];
  loadRoleOptions();
  searchData();
}

function onViewRow(row: Api.User.UserRecord): void {
  view(row.id);
}

function onEditRow(row: Api.User.UserRecord): void {
  edit(row.id);
}

async function onDeleteRow(row: Api.User.UserRecord): Promise<void> {
  await handleDelete(row.id);
}

useTenantChanged(handleTenantChanged);

onMounted(async () => {
  await loadCrudSchema();
  await getData();
});
</script>

<template>
  <DynamicCrudView
    v-model:search-model="searchParams"
    v-model:column-checks="columnChecks"
    v-model:checked-row-keys="checkedRowKeys"
    :title="$t('route.user')"
    :search-fields="searchFields"
    :columns="columns"
    :data="data"
    :loading="tableLoading"
    :scroll-x="tableScrollX"
    :row-key="row => row.id"
    :pagination="mobilePagination"
    :show-add="canManageUser"
    :show-delete="canManageUser"
    :delete-disabled="!canManageUser || checkedRowKeys.length === 0"
    @search="handleSearch"
    @add="add"
    @delete="handleBatchDelete"
    @refresh="getData"
  >
    <template #operate>
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :read-only="viewMode || !canManageUser"
        @submitted="getDataByPage"
      />
    </template>
  </DynamicCrudView>
</template>

<style scoped></style>
