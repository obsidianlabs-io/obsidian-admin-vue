import { computed, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { isTableColumnHasKey } from '@/hooks/common/table';

interface UseSchemaTableColumnsResult<RowData> {
  columnChecks: Ref<NaiveUI.TableColumnCheck[]>;
  columns: ComputedRef<NaiveUI.TableColumn<RowData>[]>;
  scrollX: ComputedRef<number>;
}

export function useSchemaTableColumns<RowData>(
  baseColumns: ComputedRef<NaiveUI.TableColumn<RowData>[]>
): UseSchemaTableColumnsResult<RowData> {
  const columnChecks = ref<NaiveUI.TableColumnCheck[]>([]);

  watch(
    baseColumns,
    value => {
      const previousMap = new Map(columnChecks.value.map(item => [String(item.key), item]));

      columnChecks.value = value
        .filter(column => isTableColumnHasKey(column))
        .map(column => {
          const key = String(column.key);
          const previous = previousMap.get(key);

          return {
            key,
            title: column.title ?? key,
            checked: previous?.checked ?? true,
            fixed: previous?.fixed ?? column.fixed ?? 'unFixed',
            visible: true
          } satisfies NaiveUI.TableColumnCheck;
        });
    },
    { immediate: true }
  );

  const columns = computed<NaiveUI.TableColumn<RowData>[]>(() => {
    const columnMap = new Map<string, NaiveUI.TableColumn<RowData>>();

    baseColumns.value.forEach(column => {
      if (isTableColumnHasKey(column)) {
        columnMap.set(String(column.key), column);
      }
    });

    return columnChecks.value
      .filter(item => item.checked)
      .map(item => {
        const column = columnMap.get(item.key);
        if (!column) {
          return null;
        }

        return {
          ...column,
          fixed: item.fixed === 'unFixed' ? undefined : item.fixed
        } as NaiveUI.TableColumn<RowData>;
      })
      .filter((item): item is NaiveUI.TableColumn<RowData> => Boolean(item));
  });

  const scrollX = computed(() => {
    return columns.value.reduce((total, column) => {
      return total + Number(column.width ?? column.minWidth ?? 120);
    }, 0);
  });

  return {
    columnChecks,
    columns,
    scrollX
  };
}
