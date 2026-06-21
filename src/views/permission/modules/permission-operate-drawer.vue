<script setup lang="ts">
import { computed, ref } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreatePermission, fetchUpdatePermission } from '@/service/api';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';
import { useOperateForm } from '../../_shared/composables/use-operate-form';

defineOptions({
  name: 'PermissionOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Permission.PermissionRecord | null;
  /** whether in view mode */
  readOnly?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const enableStatusOptions = computed(() => getEnableStatusOptions());

interface Model {
  permissionCode: string;
  permissionName: string;
  description: string;
  status: Api.Common.EnableStatus;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    permissionCode: '',
    permissionName: '',
    description: '',
    status: '1'
  };
}

const { defaultRequiredRule, naiveForm, isViewMode, title, closeDrawer, handleSubmit } = useOperateForm({
  visible,
  operateType: () => props.operateType,
  readOnly: () => props.readOnly,
  titles: {
    add: $t('page.permission.addTitle'),
    edit: $t('page.permission.editTitle'),
    view: $t('page.permission.viewTitle')
  },
  model,
  createDefaultModel,
  initModel,
  validationKeys: ['permissionCode', 'permissionName', 'status'],
  submit: submitPermission,
  onSubmitted: () => emit('submitted')
});

const baseRules: Record<'permissionCode' | 'permissionName' | 'status', App.Global.FormRule> = {
  permissionCode: defaultRequiredRule,
  permissionName: defaultRequiredRule,
  status: defaultRequiredRule
};
const rules = naiveForm.withServerValidationRules(baseRules, ['permissionCode', 'permissionName', 'status'] as const);

function initModel(): Model {
  if (props.operateType === 'edit' && props.rowData) {
    return {
      permissionCode: props.rowData.permissionCode,
      permissionName: props.rowData.permissionName,
      description: props.rowData.description,
      status: props.rowData.status
    };
  }

  return createDefaultModel();
}

async function submitPermission(currentModel: Model) {
  const permissionCode = model.value.permissionCode.trim();
  const group = getGroupByPermissionCode(permissionCode);

  const payload: Api.Permission.PermissionPayload = {
    permissionCode,
    permissionName: currentModel.permissionName.trim(),
    group: group || props.rowData?.group || '',
    description: currentModel.description.trim(),
    status: currentModel.status
  };

  return props.operateType === 'add'
    ? fetchCreatePermission(payload, { handleValidationErrorLocally: true })
    : fetchUpdatePermission(props.rowData?.id || 0, payload, { handleValidationErrorLocally: true });
}

function getGroupByPermissionCode(permissionCode: string) {
  return permissionCode.split('.')[0]?.trim() || '';
}
</script>

<template>
  <FormModalWrapper
    v-model:visible="visible"
    :title="title"
    :read-only="isViewMode"
    @submit="handleSubmit"
    @close="closeDrawer"
  >
    <NForm :ref="naiveForm.formRef" :model="model" :rules="rules" :show-require-mark="!isViewMode">
      <NGrid responsive="screen" item-responsive :x-gap="12">
        <NFormItemGi span="24 s:12" :label="$t('page.permission.permissionCode')" path="permissionCode">
          <NInput
            v-model:value="model.permissionCode"
            :readonly="operateType === 'edit' || isViewMode"
            :placeholder="isViewMode ? '' : $t('page.permission.permissionCodePlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('page.permission.permissionName')" path="permissionName">
          <NInput
            v-model:value="model.permissionName"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.permission.permissionNamePlaceholder')"
          />
        </NFormItemGi>
      </NGrid>
      <NFormItem :label="$t('common.status')" path="status">
        <NTag v-if="isViewMode" :type="getEnableStatusTagType(model.status)">
          {{ getEnableStatusLabel(model.status) }}
        </NTag>
        <NRadioGroup v-else v-model:value="model.status">
          <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
        </NRadioGroup>
      </NFormItem>
      <NFormItem :label="$t('common.description')" :show-require-mark="false">
        <NInput
          v-model:value="model.description"
          :readonly="isViewMode"
          type="textarea"
          :placeholder="isViewMode ? '' : $t('page.permission.descriptionPlaceholder')"
        />
      </NFormItem>
    </NForm>
  </FormModalWrapper>
</template>

<style scoped></style>
