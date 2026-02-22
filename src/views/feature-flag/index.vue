<script setup lang="ts">
import { h, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive } from 'vue';
import { NButton, NPopconfirm, NSwitch, NTag } from 'naive-ui';
import { appEvent } from '@/constants/event';
import { fetchFeatureFlags, purgeFeatureFlag, toggleFeatureFlag } from '@/service/api/feature-flag';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import FeatureFlagSearch from './modules/feature-flag-search.vue';

defineOptions({
  name: 'FeatureFlagsPage'
});

const searchParams = reactive({
  current: 1,
  size: 10,
  keyword: null as string | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchFeatureFlags({
      current: searchParams.current,
      size: searchParams.size,
      keyword: searchParams.keyword ?? undefined
    }),
  immediate: true,
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
      title: 'Feature Key',
      key: 'key',
      minWidth: 180,
      render(row) {
        return h('span', {}, row.key);
      }
    },
    {
      title: 'Config Default',
      key: 'enabled',
      width: 120,
      align: 'center',
      render(row) {
        return h(
          NTag,
          { type: row.enabled ? 'success' : 'error', size: 'small', bordered: false, round: true },
          { default: () => (row.enabled ? 'Enabled' : 'Disabled') }
        );
      }
    },
    {
      title: 'Rollout %',
      key: 'percentage',
      width: 100,
      align: 'center',
      render(row) {
        return h(NTag, { type: 'primary', size: 'small', bordered: false }, { default: () => `${row.percentage}%` });
      }
    },
    {
      title: 'Scope',
      key: 'scope',
      width: 140,
      render(row) {
        const tags = [];
        if (row.platform_only)
          tags.push(
            h(NTag, { size: 'small', type: 'info', bordered: false, round: true }, { default: () => 'Platform Only' })
          );
        if (row.tenant_only)
          tags.push(
            h(NTag, { size: 'small', type: 'warning', bordered: false, round: true }, { default: () => 'Tenant Only' })
          );
        if (row.role_codes.length > 0) {
          tags.push(
            h(
              NTag,
              { size: 'small', type: 'primary', bordered: false, round: true },
              { default: () => row.role_codes.join(', ') }
            )
          );
        }
        return tags.length > 0
          ? h('div', { class: 'flex flex-wrap gap-4px' }, tags)
          : h('span', { class: 'text-gray-400' }, 'All');
      }
    },
    {
      title: 'Override',
      key: 'global_override',
      width: 120,
      align: 'center',
      render(row) {
        if (row.global_override === null) {
          return h(NTag, { size: 'small', bordered: false, type: 'default' }, { default: () => 'Default' });
        }
        return h(
          NTag,
          { type: row.global_override ? 'success' : 'error', size: 'small', bordered: false, round: true },
          { default: () => (row.global_override ? 'Force ON' : 'Force OFF') }
        );
      }
    },
    {
      title: 'Toggle',
      key: 'toggle',
      width: 80,
      align: 'center',
      render(row) {
        return h(NSwitch, {
          value: row.global_override !== null ? row.global_override : row.enabled,
          onUpdateValue: async (val: boolean) => {
            const { error } = await toggleFeatureFlag(row.key, val);
            if (!error) {
              row.global_override = val;
              window.$message?.success(`Feature "${row.key}" ${val ? 'enabled' : 'disabled'}`);
            }
          }
        });
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render(row) {
        if (row.global_override === null) {
          return null;
        }
        return h(
          NPopconfirm,
          {
            onPositiveClick: async () => {
              const { error } = await purgeFeatureFlag(row.key);
              if (!error) {
                row.global_override = null;
                window.$message?.success(`Overrides for "${row.key}" purged`);
              }
            }
          },
          {
            trigger: () => h(NButton, { size: 'small', ghost: true, type: 'warning' }, { default: () => 'Reset' }),
            default: () => 'Revert to config default?'
          }
        );
      }
    }
  ]
});

let realtimeListenerBound = false;

function handleRealtimeUpdate(event: Event) {
  const customEvent = event as CustomEvent<{ topic?: string }>;
  if (customEvent.detail?.topic !== 'feature-flag') {
    return;
  }

  getData();
  window.$message?.info($t('page.featureFlag.realtimeRefreshed'));
}

function bindRealtimeListener() {
  if (realtimeListenerBound) {
    return;
  }

  window.addEventListener(appEvent.systemRealtimeUpdated, handleRealtimeUpdate as EventListener);
  realtimeListenerBound = true;
}

function unbindRealtimeListener() {
  if (!realtimeListenerBound) {
    return;
  }

  window.removeEventListener(appEvent.systemRealtimeUpdated, handleRealtimeUpdate as EventListener);
  realtimeListenerBound = false;
}

onActivated(() => {
  bindRealtimeListener();
});

onMounted(() => {
  bindRealtimeListener();
});

onDeactivated(() => {
  unbindRealtimeListener();
});

onBeforeUnmount(() => {
  unbindRealtimeListener();
});
</script>

<template>
  <TableWrapper :title="$t('route.feature-flag')">
    <template #search>
      <FeatureFlagSearch v-model:model="searchParams" @search="getDataByPage" />
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
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="mobilePagination"
      :row-key="row => row.key"
      size="small"
      class="sm:h-full"
      flex-height
      :scroll-x="800"
    />
  </TableWrapper>
</template>

<style scoped></style>
