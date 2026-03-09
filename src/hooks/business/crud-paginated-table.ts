import { computed, unref } from 'vue';
import type { Ref } from 'vue';
import { useAsyncState } from '@vueuse/core';
import type { PaginationProps } from 'naive-ui';
import type { FlatResponseData } from '@sa/axios';
import { shouldSkipGlobalErrorToast } from '@/service/request/shared';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

type SearchParams = {
  current: number;
  size: number;
} & Record<string, unknown>;

type PaginatedResponse<RowData> = FlatResponseData<any, Api.Common.PaginatingQueryRecord<RowData>>;

interface UseCrudPaginatedTableOptions<RowData, QueryParams extends SearchParams> {
  searchParams: QueryParams | Ref<QueryParams>;
  api: (params: Partial<QueryParams>) => Promise<PaginatedResponse<RowData>>;
  columns: () => NaiveUI.TableColumn<RowData>[];
  mapParams?: (params: QueryParams) => Partial<QueryParams>;
  paginationProps?: Omit<PaginationProps, 'page' | 'pageSize' | 'itemCount'>;
  showTotal?: boolean;
  getColumnVisible?: (column: NaiveUI.TableColumn<RowData>) => boolean;
  immediate?: boolean;
  notifyOnError?: boolean;
  resolveErrorMessage?: (error: unknown) => string;
}

function normalizeQueryParams<Query extends Record<string, unknown>>(params: Query): Partial<Query> {
  const normalized: Partial<Query> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      normalized[key as keyof Query] = value as Query[keyof Query];
    }
  });

  return normalized;
}

export function useCrudPaginatedTable<RowData, QueryParams extends SearchParams>(
  options: UseCrudPaginatedTableOptions<RowData, QueryParams>
) {
  const table = useNaivePaginatedTable({
    api: async () => {
      const resolvedSearchParams = unref(options.searchParams);
      const mappedParams = options.mapParams?.(resolvedSearchParams) ?? resolvedSearchParams;
      const response = await options.api(normalizeQueryParams(mappedParams) as Partial<QueryParams>);

      if (response.error && (options.notifyOnError ?? true) && !shouldSkipGlobalErrorToast(response.error)) {
        const message = options.resolveErrorMessage?.(response.error) ?? $t('common.error');
        window.$message?.error(message);
      }

      return response;
    },
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      const resolvedSearchParams = unref(options.searchParams);
      resolvedSearchParams.current = params.page ?? 1;
      resolvedSearchParams.size = params.pageSize ?? 10;
    },
    columns: options.columns,
    paginationProps: options.paginationProps,
    showTotal: options.showTotal,
    getColumnVisible: options.getColumnVisible
  });

  const initState = useAsyncState(
    async () => {
      await table.getData();
      return true;
    },
    false,
    {
      immediate: options.immediate ?? true,
      resetOnExecute: false
    }
  );

  const tableLoading = computed(() => table.loading.value || initState.isLoading.value);

  async function search() {
    unref(options.searchParams).current = 1;
    await table.getDataByPage();
  }

  async function refresh() {
    await table.getData();
  }

  return {
    ...table,
    tableLoading,
    initLoading: initState.isLoading,
    initReady: initState.state,
    executeInitialLoad: initState.execute,
    search,
    refresh
  };
}
