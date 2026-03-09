<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
import { fetchGetAuditLogList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTenantChanged } from '@/hooks/business/tenant-change';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import AuditDetailModal from './modules/audit-detail-modal.vue';
import AuditSearch from './modules/audit-search.vue';

defineOptions({
  name: 'AuditPage'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const canViewAudit = computed(() => hasAuth('audit.view'));

function getDefaultDateRange(): [number, number] {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return [now - 7 * ONE_DAY, now];
}

function createDefaultDateFilters() {
  const [dateFrom, dateTo] = getDefaultDateRange();

  return {
    dateFrom,
    dateTo
  };
}

const defaultDateFilters = createDefaultDateFilters();

const searchParams = ref({
  current: 1,
  size: 10,
  keyword: null as string | null,
  action: null as string | null,
  logType: null as Api.Audit.AuditLogType | '' | null,
  userName: null as string | null,
  requestId: null as string | null,
  dateFrom: defaultDateFilters.dateFrom as number | null,
  dateTo: defaultDateFilters.dateTo as number | null
});

const detailVisible = ref(false);
const detailRow = ref<Api.Audit.AuditLogRecord | null>(null);

function formatLocalDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function resolveDateFrom(): string | undefined {
  if (!searchParams.value.dateFrom) {
    return undefined;
  }

  return formatLocalDateTime(searchParams.value.dateFrom);
}

function resolveDateTo(): string | undefined {
  if (!searchParams.value.dateTo) {
    return undefined;
  }

  return formatLocalDateTime(searchParams.value.dateTo);
}

function resolveLogTypeLabel(logType: Api.Audit.AuditLogType | string | null | undefined): string {
  const normalized = (logType ?? '').toString().trim();

  switch (normalized) {
    case 'login':
      return $t('page.audit.logTypeLogin');
    case 'api':
      return $t('page.audit.logTypeApi');
    case 'data':
      return $t('page.audit.logTypeData');
    case 'permission':
      return $t('page.audit.logTypePermission');
    case 'operation':
    default:
      return $t('page.audit.logTypeOperation');
  }
}

function resolveLogTypeTagType(logType: Api.Audit.AuditLogType | string | null | undefined) {
  const normalized = (logType ?? '').toString().trim();

  switch (normalized) {
    case 'login':
      return 'info';
    case 'api':
      return 'warning';
    case 'data':
      return 'success';
    case 'permission':
      return 'error';
    case 'operation':
    default:
      return 'default';
  }
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetAuditLogList({
      current: searchParams.value.current,
      size: searchParams.value.size,
      keyword: searchParams.value.keyword ?? undefined,
      action: searchParams.value.action ?? undefined,
      logType: searchParams.value.logType || undefined,
      userName: searchParams.value.userName ?? undefined,
      requestId: searchParams.value.requestId ?? undefined,
      dateFrom: resolveDateFrom(),
      dateTo: resolveDateTo()
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page ?? 1;
    searchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => (searchParams.value.current - 1) * searchParams.value.size + index + 1
    },
    {
      key: 'action',
      title: $t('page.audit.action'),
      align: 'center',
      minWidth: 200
    },
    {
      key: 'logType',
      title: $t('page.audit.logType'),
      align: 'center',
      minWidth: 120,
      render: row =>
        h(
          NTag,
          {
            type: resolveLogTypeTagType(row.logType),
            size: 'small',
            bordered: false
          },
          { default: () => resolveLogTypeLabel(row.logType) }
        )
    },
    {
      key: 'userName',
      title: $t('page.audit.operator'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'tenantName',
      title: $t('common.tenant'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'target',
      title: $t('page.audit.target'),
      align: 'center',
      minWidth: 220
    },
    {
      key: 'ipAddress',
      title: $t('page.audit.ipAddress'),
      align: 'center',
      minWidth: 130
    },
    {
      key: 'requestId',
      title: $t('page.audit.requestId'),
      align: 'center',
      minWidth: 200
    },
    {
      key: 'createTime',
      title: $t('common.createdAt'),
      align: 'center',
      width: 180
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 96,
      fixed: 'right',
      render: row => {
        return h(
          NButton,
          {
            type: 'default',
            ghost: true,
            size: 'small',
            onClick: () => view(row)
          },
          { default: () => $t('common.view') }
        );
      }
    }
  ]
});

function handleSearch() {
  searchParams.value.current = 1;
  getDataByPage();
}

function view(row: Api.Audit.AuditLogRecord) {
  detailRow.value = row;
  detailVisible.value = true;
}

function resetSearchParamsForTenantChange() {
  const { dateFrom, dateTo } = createDefaultDateFilters();

  searchParams.value.current = 1;
  searchParams.value.keyword = null;
  searchParams.value.action = null;
  searchParams.value.logType = null;
  searchParams.value.userName = null;
  searchParams.value.requestId = null;
  searchParams.value.dateFrom = dateFrom;
  searchParams.value.dateTo = dateTo;
}

function handleTenantChanged() {
  resetSearchParamsForTenantChange();
  getDataByPage();
}

useTenantChanged(handleTenantChanged);
</script>

<template>
  <TableWrapper :title="$t('route.audit')">
    <template #search>
      <AuditSearch v-model:model="searchParams" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="false"
        :show-delete="false"
        :loading="loading"
        @refresh="getData"
      />
    </template>
    <NDataTable
      size="small"
      class="sm:h-full"
      remote
      :columns="columns"
      :data="data"
      :loading="loading || !canViewAudit"
      :flex-height="!appStore.isMobile"
      :scroll-x="1650"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <AuditDetailModal v-model:visible="detailVisible" :row-data="detailRow" />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
