<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { NButton } from 'naive-ui';
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

const searchParams = reactive({
  current: 1,
  size: 10,
  keyword: null as string | null,
  action: null as string | null,
  userName: null as string | null,
  dateRange: null as [number, number] | null
});

const detailVisible = ref(false);
const detailRow = ref<Api.Audit.AuditLogRecord | null>(null);

function formatLocalDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function resolveDateFrom(): string | undefined {
  if (!searchParams.dateRange?.[0]) {
    return undefined;
  }

  return formatLocalDateTime(searchParams.dateRange[0]);
}

function resolveDateTo(): string | undefined {
  if (!searchParams.dateRange?.[1]) {
    return undefined;
  }

  return formatLocalDateTime(searchParams.dateRange[1]);
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetAuditLogList({
      current: searchParams.current,
      size: searchParams.size,
      keyword: searchParams.keyword ?? undefined,
      action: searchParams.action ?? undefined,
      userName: searchParams.userName ?? undefined,
      dateFrom: resolveDateFrom(),
      dateTo: resolveDateTo()
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.current = params.page ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => (searchParams.current - 1) * searchParams.size + index + 1
    },
    {
      key: 'action',
      title: $t('page.audit.action'),
      align: 'center',
      minWidth: 200
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
  searchParams.current = 1;
  getDataByPage();
}

function view(row: Api.Audit.AuditLogRecord) {
  detailRow.value = row;
  detailVisible.value = true;
}

function resetSearchParamsForTenantChange() {
  searchParams.current = 1;
  searchParams.keyword = null;
  searchParams.action = null;
  searchParams.userName = null;
  searchParams.dateRange = null;
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
      :scroll-x="1350"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <AuditDetailModal v-model:visible="detailVisible" :row-data="detailRow" />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
