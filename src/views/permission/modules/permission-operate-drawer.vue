<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreatePermission, fetchUpdatePermission } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';

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

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const isViewMode = computed(() => Boolean(props.readOnly));
const enableStatusOptions = computed(() => getEnableStatusOptions());

const title = computed(() => {
  if (isViewMode.value) {
    return $t('page.permission.viewTitle');
  }

  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.permission.addTitle'),
    edit: $t('page.permission.editTitle')
  };
  return titles[props.operateType];
});

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

const rules: Record<'permissionCode' | 'permissionName' | 'status', App.Global.FormRule> = {
  permissionCode: defaultRequiredRule,
  permissionName: defaultRequiredRule,
  status: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      permissionCode: props.rowData.permissionCode,
      permissionName: props.rowData.permissionName,
      description: props.rowData.description,
      status: props.rowData.status
    };
  }
}

function getGroupByPermissionCode(permissionCode: string) {
  return permissionCode.split('.')[0]?.trim() || '';
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (isViewMode.value) {
    return;
  }

  await validate();

  const permissionCode = model.value.permissionCode.trim();
  const group = getGroupByPermissionCode(permissionCode);

  const payload: Api.Permission.PermissionPayload = {
    permissionCode,
    permissionName: model.value.permissionName.trim(),
    group: group || props.rowData?.group || '',
    description: model.value.description.trim(),
    status: model.value.status
  };

  const { error } =
    props.operateType === 'add'
      ? await fetchCreatePermission(payload)
      : await fetchUpdatePermission(props.rowData?.id || 0, payload);

  if (!error) {
    window.$message?.success(props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <FormModalWrapper
    v-model:visible="visible"
    :title="title"
    :read-only="isViewMode"
    @submit="handleSubmit"
    @close="closeDrawer"
  >
    <NForm ref="formRef" :model="model" :rules="rules" :show-require-mark="!isViewMode">
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
