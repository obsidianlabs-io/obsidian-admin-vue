import { watch } from 'vue';
import type { Ref } from 'vue';
import { shouldApplyServerValidation } from '@/service/request/shared';
import { useOperateModal } from '@/hooks/business/operate-modal';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

interface UseOperateFormOptions<TModel> {
  visible: Ref<boolean>;
  operateType: () => NaiveUI.TableOperateType;
  readOnly?: () => boolean | undefined;
  titles: {
    add: string;
    edit: string;
    view: string;
  };
  model: Ref<TModel>;
  createDefaultModel: () => TModel;
  initModel?: () => TModel;
  validationKeys?: readonly string[];
  onOpened?: () => unknown | Promise<unknown>;
  beforeSubmit?: () => boolean | undefined | Promise<boolean | undefined>;
  submit: (model: TModel) => Promise<{ error: unknown }>;
  onSubmitted: () => void;
}

export function useOperateForm<TModel>(options: UseOperateFormOptions<TModel>) {
  const naiveForm = useNaiveForm();
  const formRules = useFormRules();
  const { isViewMode, title } = useOperateModal({
    operateType: options.operateType,
    readOnly: options.readOnly,
    titles: options.titles
  });

  if (options.validationKeys?.length) {
    naiveForm.bindModelValidation(options.model as Ref<Record<string, unknown>>, [...options.validationKeys]);
  }

  function resetModel() {
    options.model.value = options.initModel?.() ?? options.createDefaultModel();
  }

  function closeDrawer() {
    options.visible.value = false;
  }

  async function handleSubmit() {
    if (isViewMode.value) {
      return;
    }

    await naiveForm.validate();

    const beforeSubmitResult = await options.beforeSubmit?.();
    if (beforeSubmitResult === false) {
      return;
    }

    const { error } = await options.submit(options.model.value);

    if (error && shouldApplyServerValidation(error)) {
      await naiveForm.applyServerValidation(error);
    }

    if (!error) {
      window.$message?.success(options.operateType() === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
      closeDrawer();
      options.onSubmitted();
    }
  }

  watch(options.visible, async () => {
    if (options.visible.value) {
      resetModel();
      naiveForm.restoreValidation();
      await options.onOpened?.();
    }
  });

  return {
    ...formRules,
    naiveForm,
    isViewMode,
    title,
    closeDrawer,
    handleSubmit,
    resetModel
  };
}
