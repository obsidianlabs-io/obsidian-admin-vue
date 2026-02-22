<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateTenant, fetchUpdateTenant } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';

defineOptions({
  name: 'TenantOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Tenant.TenantRecord | null;
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
    return $t('page.tenant.viewTitle');
  }

  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.tenant.addTitle'),
    edit: $t('page.tenant.editTitle')
  };
  return titles[props.operateType];
});

interface Model {
  tenantCode: string;
  tenantName: string;
  status: Api.Common.EnableStatus;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    tenantCode: '',
    tenantName: '',
    status: '1'
  };
}

const rules: Record<'tenantCode' | 'tenantName' | 'status', App.Global.FormRule> = {
  tenantCode: defaultRequiredRule,
  tenantName: defaultRequiredRule,
  status: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      tenantCode: props.rowData.tenantCode,
      tenantName: props.rowData.tenantName,
      status: props.rowData.status
    };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (isViewMode.value) {
    return;
  }

  await validate();

  const payload: Api.Tenant.TenantPayload = {
    tenantCode: model.value.tenantCode.trim(),
    tenantName: model.value.tenantName.trim(),
    status: model.value.status
  };

  const { error } =
    props.operateType === 'add'
      ? await fetchCreateTenant(payload)
      : await fetchUpdateTenant(props.rowData?.id || 0, payload);

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
        <NFormItemGi span="24 s:12" :label="$t('page.tenant.tenantCode')" path="tenantCode">
          <NInput
            v-model:value="model.tenantCode"
            :readonly="operateType === 'edit' || isViewMode"
            :placeholder="isViewMode ? '' : $t('page.tenant.tenantCodePlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('page.tenant.tenantName')" path="tenantName">
          <NInput
            v-model:value="model.tenantName"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.tenant.tenantNamePlaceholder')"
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
    </NForm>
  </FormModalWrapper>
</template>

<style scoped></style>
