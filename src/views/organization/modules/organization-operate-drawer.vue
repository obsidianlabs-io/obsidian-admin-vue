<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateOrganization, fetchUpdateOrganization } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';

defineOptions({
  name: 'OrganizationOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Organization.OrganizationRecord | null;
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

const naiveForm = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const isViewMode = computed(() => Boolean(props.readOnly));
const enableStatusOptions = computed(() => getEnableStatusOptions());

const title = computed(() => {
  if (isViewMode.value) {
    return $t('page.organization.viewTitle');
  }

  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.organization.addTitle'),
    edit: $t('page.organization.editTitle')
  };

  return titles[props.operateType];
});

interface Model {
  organizationCode: string;
  organizationName: string;
  description: string;
  status: Api.Common.EnableStatus;
  sort: number | null;
}

const model = ref<Model>(createDefaultModel());
naiveForm.bindModelValidation(model, ['organizationCode', 'organizationName', 'status']);

function createDefaultModel(): Model {
  return {
    organizationCode: '',
    organizationName: '',
    description: '',
    status: '1',
    sort: 0
  };
}

const baseRules: Record<'organizationCode' | 'organizationName' | 'status', App.Global.FormRule> = {
  organizationCode: defaultRequiredRule,
  organizationName: defaultRequiredRule,
  status: defaultRequiredRule
};
const rules = naiveForm.withServerValidationRules(baseRules, [
  'organizationCode',
  'organizationName',
  'status'
] as const);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      organizationCode: props.rowData.organizationCode,
      organizationName: props.rowData.organizationName,
      description: props.rowData.description || '',
      status: props.rowData.status,
      sort: props.rowData.sort ?? 0
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

  await naiveForm.validate();

  const payload: Api.Organization.OrganizationPayload = {
    organizationCode: model.value.organizationCode.trim(),
    organizationName: model.value.organizationName.trim(),
    description: model.value.description.trim(),
    status: model.value.status,
    sort: Number(model.value.sort ?? 0)
  };

  const { error } =
    props.operateType === 'add'
      ? await fetchCreateOrganization(payload, { handleValidationErrorLocally: true })
      : await fetchUpdateOrganization(props.rowData?.id || 0, payload, { handleValidationErrorLocally: true });

  if (error) {
    await naiveForm.applyServerValidation(error);
  }

  if (!error) {
    window.$message?.success(props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    naiveForm.restoreValidation();
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
    <NForm :ref="naiveForm.formRef" :model="model" :rules="rules" :show-require-mark="!isViewMode">
      <NGrid responsive="screen" item-responsive :x-gap="12">
        <NFormItemGi span="24 s:12" :label="$t('page.organization.organizationCode')" path="organizationCode">
          <NInput
            v-model:value="model.organizationCode"
            :readonly="operateType === 'edit' || isViewMode"
            :placeholder="isViewMode ? '' : $t('page.organization.organizationCodePlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('page.organization.organizationName')" path="organizationName">
          <NInput
            v-model:value="model.organizationName"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.organization.organizationNamePlaceholder')"
          />
        </NFormItemGi>
      </NGrid>

      <NGrid responsive="screen" item-responsive :x-gap="12">
        <NFormItemGi span="24 s:12" :label="$t('page.organization.sort')" path="sort">
          <NInputNumber
            v-model:value="model.sort"
            class="w-full"
            :min="0"
            :max="65535"
            :precision="0"
            :step="1"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.organization.sortPlaceholder')"
          />
        </NFormItemGi>
      </NGrid>

      <NFormItem :label="$t('common.description')" path="description">
        <NInput
          v-model:value="model.description"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :readonly="isViewMode"
          :placeholder="isViewMode ? '' : $t('page.organization.descriptionPlaceholder')"
        />
      </NFormItem>

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
