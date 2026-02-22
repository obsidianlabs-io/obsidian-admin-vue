import { type Ref, ref } from 'vue';
import { useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';

type DeleteApiResponse = {
  error?: unknown;
};

interface UseCrudTableOptions<TableData> {
  data: Ref<TableData[]>;
  idKey: keyof TableData;
  getData: () => Promise<void>;
  canManage: Ref<boolean>;
  deleteById: (id: number) => Promise<DeleteApiResponse>;
  onAfterDeleteSuccess?: () => void | Promise<void>;
}

export function useCrudTable<TableData extends object>(options: UseCrudTableOptions<TableData>) {
  const viewMode = ref(false);

  const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
    useTableOperate(options.data, options.idKey, options.getData);

  function add() {
    if (!options.canManage.value) {
      return;
    }

    viewMode.value = false;
    handleAdd();
  }

  function edit(id: number) {
    if (!options.canManage.value) {
      return;
    }

    viewMode.value = false;
    handleEdit(id as TableData[keyof TableData]);
  }

  function view(id: number) {
    viewMode.value = true;
    handleEdit(id as TableData[keyof TableData]);
  }

  async function handleDelete(id: number) {
    if (!options.canManage.value) {
      return;
    }

    const { error } = await options.deleteById(id);

    if (!error) {
      await onDeleted();
      await options.onAfterDeleteSuccess?.();
    }
  }

  async function handleBatchDelete() {
    if (!options.canManage.value) {
      return;
    }

    const ids = checkedRowKeys.value.map(key => Number(key)).filter(id => Number.isInteger(id) && id > 0);
    if (!ids.length) {
      return;
    }

    const results = await Promise.all(ids.map(id => options.deleteById(id)));
    const successCount = results.filter(item => !item.error).length;
    const failedCount = ids.length - successCount;

    if (successCount === ids.length) {
      await onBatchDeleted();
      await options.onAfterDeleteSuccess?.();

      return;
    }

    if (successCount > 0) {
      checkedRowKeys.value = [];
      await options.getData();
      await options.onAfterDeleteSuccess?.();

      window.$message?.warning(
        $t('common.batchDeletePartialResult', {
          success: String(successCount),
          failed: String(failedCount)
        })
      );

      return;
    }

    window.$message?.error($t('common.batchDeleteFailed'));
  }

  return {
    viewMode,
    drawerVisible,
    operateType,
    editingData,
    checkedRowKeys,
    add,
    edit,
    view,
    handleDelete,
    handleBatchDelete
  };
}
