<script setup lang="ts">
import { h, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue';
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

const searchParams = ref({
  current: 1,
  size: 10,
  keyword: null as string | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchFeatureFlags({
      current: searchParams.value.current,
      size: searchParams.value.size,
      keyword: searchParams.value.keyword ?? undefined
    }),
  immediate: true,
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
      title: $t('page.featureFlag.featureKey'),
      key: 'key',
      minWidth: 180,
      render(row) {
        return h('span', {}, row.key);
      }
    },
    {
      title: $t('page.featureFlag.configDefault'),
      key: 'enabled',
      width: 120,
      align: 'center',
      render(row) {
        return h(
          NTag,
          { type: row.enabled ? 'success' : 'error', size: 'small', bordered: false, round: true },
          { default: () => (row.enabled ? $t('page.featureFlag.enabled') : $t('page.featureFlag.disabled')) }
        );
      }
    },
    {
      title: $t('page.featureFlag.rolloutPercentage'),
      key: 'percentage',
      width: 100,
      align: 'center',
      render(row) {
        return h(NTag, { type: 'primary', size: 'small', bordered: false }, { default: () => `${row.percentage}%` });
      }
    },
    {
      title: $t('page.featureFlag.scope'),
      key: 'scope',
      width: 140,
      render(row) {
        const tags = [];
        if (row.platform_only)
          tags.push(
            h(
              NTag,
              { size: 'small', type: 'info', bordered: false, round: true },
              {
                default: () => $t('page.featureFlag.platformOnly')
              }
            )
          );
        if (row.tenant_only)
          tags.push(
            h(
              NTag,
              { size: 'small', type: 'warning', bordered: false, round: true },
              {
                default: () => $t('page.featureFlag.tenantOnly')
              }
            )
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
          : h('span', { class: 'text-gray-400' }, $t('page.featureFlag.all'));
      }
    },
    {
      title: $t('page.featureFlag.override'),
      key: 'global_override',
      width: 120,
      align: 'center',
      render(row) {
        if (row.global_override === null) {
          return h(
            NTag,
            { size: 'small', bordered: false, type: 'default' },
            {
              default: () => $t('page.featureFlag.default')
            }
          );
        }
        return h(
          NTag,
          { type: row.global_override ? 'success' : 'error', size: 'small', bordered: false, round: true },
          {
            default: () => (row.global_override ? $t('page.featureFlag.forceOn') : $t('page.featureFlag.forceOff'))
          }
        );
      }
    },
    {
      title: $t('page.featureFlag.toggle'),
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
              const status = val ? $t('page.featureFlag.enabled') : $t('page.featureFlag.disabled');
              window.$message?.success($t('page.featureFlag.toggleSuccess', { key: row.key, status }));
            }
          }
        });
      }
    },
    {
      title: $t('common.action'),
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
                window.$message?.success($t('page.featureFlag.purgeSuccess', { key: row.key }));
              }
            }
          },
          {
            trigger: () =>
              h(
                NButton,
                { size: 'small', ghost: true, type: 'warning' },
                { default: () => $t('page.featureFlag.reset') }
              ),
            default: () => $t('page.featureFlag.resetConfirm')
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
