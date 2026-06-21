<script setup lang="ts">
import { computed, ref } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateTeam, fetchUpdateTeam } from '@/service/api';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';
import { useOperateForm } from '../../_shared/composables/use-operate-form';

defineOptions({
  name: 'TeamOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Team.TeamRecord | null;
  organizationOptions: CommonType.Option<number>[];
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
const organizationNameById = computed(() => {
  const map = new Map<number, string>();

  props.organizationOptions.forEach(option => {
    map.set(option.value, option.label);
  });

  return map;
});

interface Model {
  organizationId: number | null;
  teamCode: string;
  teamName: string;
  description: string;
  status: Api.Common.EnableStatus;
  sort: number | null;
}

const model = ref<Model>(createDefaultModel());

function resolveDefaultOrganizationId(): number | null {
  const first = props.organizationOptions[0];

  return typeof first?.value === 'number' ? first.value : null;
}

function createDefaultModel(): Model {
  return {
    organizationId: resolveDefaultOrganizationId(),
    teamCode: '',
    teamName: '',
    description: '',
    status: '1',
    sort: 0
  };
}

const { defaultRequiredRule, naiveForm, isViewMode, title, closeDrawer, handleSubmit } = useOperateForm({
  visible,
  operateType: () => props.operateType,
  readOnly: () => props.readOnly,
  titles: {
    add: $t('page.team.addTitle'),
    edit: $t('page.team.editTitle'),
    view: $t('page.team.viewTitle')
  },
  model,
  createDefaultModel,
  initModel,
  validationKeys: ['organizationId', 'teamCode', 'teamName', 'status'],
  beforeSubmit: ensureOrganizationSelected,
  submit: submitTeam,
  onSubmitted: () => emit('submitted')
});

const baseRules: Record<'organizationId' | 'teamCode' | 'teamName' | 'status', App.Global.FormRule> = {
  organizationId: defaultRequiredRule,
  teamCode: defaultRequiredRule,
  teamName: defaultRequiredRule,
  status: defaultRequiredRule
};
const rules = naiveForm.withServerValidationRules(baseRules, [
  'organizationId',
  'teamCode',
  'teamName',
  'status'
] as const);

const selectedOrganizationName = computed(() => {
  const current = model.value.organizationId;

  if (typeof current !== 'number' || current <= 0) {
    return props.rowData?.organizationName || '';
  }

  return organizationNameById.value.get(current) || props.rowData?.organizationName || '';
});

function initModel(): Model {
  if (props.operateType === 'edit' && props.rowData) {
    return {
      organizationId: Number(props.rowData.organizationId || 0) || resolveDefaultOrganizationId(),
      teamCode: props.rowData.teamCode,
      teamName: props.rowData.teamName,
      description: props.rowData.description || '',
      status: props.rowData.status,
      sort: props.rowData.sort ?? 0
    };
  }

  return createDefaultModel();
}

function ensureOrganizationSelected() {
  const organizationId = Number(model.value.organizationId ?? 0);
  if (!organizationId) {
    window.$message?.warning($t('page.team.organizationRequired'));
    return false;
  }

  return true;
}

async function submitTeam(currentModel: Model) {
  const organizationId = Number(currentModel.organizationId ?? 0);
  const payload: Api.Team.TeamPayload = {
    organizationId,
    teamCode: currentModel.teamCode.trim(),
    teamName: currentModel.teamName.trim(),
    description: currentModel.description.trim(),
    status: currentModel.status,
    sort: Number(currentModel.sort ?? 0)
  };

  return props.operateType === 'add'
    ? fetchCreateTeam(payload, { handleValidationErrorLocally: true })
    : fetchUpdateTeam(props.rowData?.id || 0, payload, { handleValidationErrorLocally: true });
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
        <NFormItemGi span="24 s:12" :label="$t('page.team.organization')" path="organizationId">
          <NInput v-if="isViewMode" :value="selectedOrganizationName" readonly />
          <NSelect
            v-else
            v-model:value="model.organizationId"
            clearable
            filterable
            :options="organizationOptions"
            :placeholder="$t('page.team.organizationPlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('page.team.teamCode')" path="teamCode">
          <NInput
            v-model:value="model.teamCode"
            :readonly="operateType === 'edit' || isViewMode"
            :placeholder="isViewMode ? '' : $t('page.team.teamCodePlaceholder')"
          />
        </NFormItemGi>
      </NGrid>

      <NGrid responsive="screen" item-responsive :x-gap="12">
        <NFormItemGi span="24 s:12" :label="$t('page.team.teamName')" path="teamName">
          <NInput
            v-model:value="model.teamName"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.team.teamNamePlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('page.team.sort')" path="sort">
          <NInputNumber
            v-model:value="model.sort"
            class="w-full"
            :min="0"
            :max="65535"
            :precision="0"
            :step="1"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.team.sortPlaceholder')"
          />
        </NFormItemGi>
      </NGrid>

      <NFormItem :label="$t('common.description')" path="description">
        <NInput
          v-model:value="model.description"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :readonly="isViewMode"
          :placeholder="isViewMode ? '' : $t('page.team.descriptionPlaceholder')"
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
