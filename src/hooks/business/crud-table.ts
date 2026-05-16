import { type Ref, ref } from 'vue';
import { resolveRequestErrorStrategy } from '@/service/request/shared';
import { useTableOperate } from '@/hooks/common/table';
import { getNaiveMessage } from '@/utils/naive-ui';
import { $t } from '@/locales';

type DeleteApiResponse = {
  data?: unknown;
  error?: unknown;
};

type DeleteAction = 'deactivated' | 'soft_deleted' | 'queued_for_hard_delete';

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

  const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys } = useTableOperate(
    options.data,
    options.idKey,
    options.getData
  );

  function resolveDeleteAction(response: DeleteApiResponse): DeleteAction | undefined {
    if (!response.data || typeof response.data !== 'object') {
      return undefined;
    }

    const action = (response.data as { action?: unknown }).action;

    return action === 'deactivated' || action === 'soft_deleted' || action === 'queued_for_hard_delete'
      ? action
      : undefined;
  }

  function resolveDeleteSuccessMessage(action: DeleteAction | undefined): string {
    return action === 'deactivated' ? $t('common.deactivateSuccess') : $t('common.deleteSuccess');
  }

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

    const response = await options.deleteById(id);

    if (!response.error) {
      await options.getData();
      await options.onAfterDeleteSuccess?.();
      getNaiveMessage()?.success(resolveDeleteSuccessMessage(resolveDeleteAction(response)));
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
    const hasFailureAlreadyPresented = results.some(item => {
      if (!item.error) {
        return false;
      }

      return resolveRequestErrorStrategy(item.error).shouldShowGlobalToast;
    });

    if (successCount === ids.length) {
      checkedRowKeys.value = [];
      await options.getData();
      await options.onAfterDeleteSuccess?.();
      const deactivatedCount = results.filter(
        item => !item.error && resolveDeleteAction(item) === 'deactivated'
      ).length;

      getNaiveMessage()?.success(
        deactivatedCount === successCount ? $t('common.deactivateSuccess') : $t('common.deleteSuccess')
      );

      return;
    }

    if (successCount > 0) {
      checkedRowKeys.value = [];
      await options.getData();
      await options.onAfterDeleteSuccess?.();

      getNaiveMessage()?.warning(
        $t('common.batchDeletePartialResult', {
          success: String(successCount),
          failed: String(failedCount)
        })
      );

      return;
    }

    if (!hasFailureAlreadyPresented) {
      getNaiveMessage()?.error($t('common.batchDeleteFailed'));
    }
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
