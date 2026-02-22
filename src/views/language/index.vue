<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { getEnableStatusLabel, getEnableStatusTagType } from '@/constants/common';
import { fetchDeleteLanguageTranslation, fetchGetLanguageList, fetchGetLanguageOptions } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useCrudTable } from '@/hooks/business/crud-table';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t, refreshRuntimeLocaleMessages } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import LanguageOperateDrawer from './modules/language-operate-drawer.vue';
import LanguageSearch from './modules/language-search.vue';

defineOptions({
  name: 'LanguagePage'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();

const canManageLanguage = computed(() => hasAuth('language.manage'));

const localeOptions = ref<CommonType.Option<App.I18n.LangType>[]>([]);

const searchParams = reactive({
  current: 1,
  size: 10,
  locale: null as App.I18n.LangType | null,
  keyword: null as string | null,
  status: null as Api.Common.EnableStatus | null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () =>
    fetchGetLanguageList({
      current: searchParams.current,
      size: searchParams.size,
      locale: searchParams.locale ?? undefined,
      keyword: searchParams.keyword ?? undefined,
      status: searchParams.status ?? undefined
    }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.current = params.page ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    ...(canManageLanguage.value
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
      key: 'locale',
      title: $t('common.locale'),
      align: 'center',
      width: 120
    },
    {
      key: 'translationKey',
      title: $t('page.language.translationKey'),
      align: 'left',
      minWidth: 260
    },
    {
      key: 'translationValue',
      title: $t('page.language.translationValue'),
      align: 'left',
      minWidth: 260,
      ellipsis: {
        tooltip: true
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
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: canManageLanguage.value ? 220 : 96,
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

        if (!canManageLanguage.value) {
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

async function handleDeleteLocaleRuntimeCache() {
  await refreshRuntimeLocaleMessages();
  await appStore.refreshLocaleOptions();
}

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
  canManage: canManageLanguage,
  deleteById: fetchDeleteLanguageTranslation,
  onAfterDeleteSuccess: handleDeleteLocaleRuntimeCache
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

async function loadLocaleOptions() {
  const { data: responseData, error } = await fetchGetLanguageOptions();

  if (error) {
    return;
  }

  const options = responseData.records
    .filter(item => item.status === '1')
    .map(item => ({
      label: `${item.locale} - ${item.localeName}`,
      value: item.locale
    }));

  localeOptions.value = options;
}

async function handleSubmitted() {
  await getDataByPage();
  await handleDeleteLocaleRuntimeCache();
}

onMounted(async () => {
  await loadLocaleOptions();
});
</script>

<template>
  <TableWrapper :title="$t('route.language')">
    <template #search>
      <LanguageSearch v-model:model="searchParams" :locale-options="localeOptions" @search="handleSearch" />
    </template>
    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="canManageLanguage"
        :show-delete="canManageLanguage"
        :disabled-delete="!canManageLanguage || checkedRowKeys.length === 0"
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
      :scroll-x="1400"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
    <template #operate>
      <LanguageOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        :read-only="viewMode || !canManageLanguage"
        :locale-options="localeOptions"
        @submitted="handleSubmitted"
      />
    </template>
  </TableWrapper>
</template>

<style scoped></style>
