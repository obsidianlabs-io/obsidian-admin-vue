<script setup lang="ts">
import { computed, ref } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateLanguageTranslation, fetchUpdateLanguageTranslation } from '@/service/api';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';
import { getDefaultLocale } from '@/locales/default-locale';
import { useOperateForm } from '../../_shared/composables/use-operate-form';

defineOptions({
  name: 'LanguageOperateDrawer'
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.Language.TranslationRecord | null;
  readOnly?: boolean;
  localeOptions: CommonType.Option<App.I18n.LangType>[];
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
  locale: App.I18n.LangType | null;
  translationKey: string;
  translationValue: string;
  description: string;
  status: Api.Common.EnableStatus;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    locale: getDefaultLocale(),
    translationKey: '',
    translationValue: '',
    description: '',
    status: '1'
  };
}

const { defaultRequiredRule, naiveForm, isViewMode, title, closeDrawer, handleSubmit } = useOperateForm({
  visible,
  operateType: () => props.operateType,
  readOnly: () => props.readOnly,
  titles: {
    add: $t('page.language.addTitle'),
    edit: $t('page.language.editTitle'),
    view: $t('page.language.viewTitle')
  },
  model,
  createDefaultModel,
  initModel,
  validationKeys: ['locale', 'translationKey', 'translationValue', 'status'],
  submit: submitLanguageTranslation,
  onSubmitted: () => emit('submitted')
});

const baseRules: Partial<Record<'locale' | 'translationKey' | 'translationValue' | 'status', App.Global.FormRule[]>> = {
  locale: [defaultRequiredRule],
  translationKey: [defaultRequiredRule],
  translationValue: [defaultRequiredRule],
  status: [defaultRequiredRule]
};
const rules = naiveForm.withServerValidationRules(baseRules, [
  'locale',
  'translationKey',
  'translationValue',
  'status'
] as const);

function resolveDefaultLocale(): App.I18n.LangType {
  if (props.rowData?.locale) {
    return props.rowData.locale;
  }

  return (props.localeOptions[0]?.value || getDefaultLocale()) as App.I18n.LangType;
}

function initModel(): Model {
  const defaultModel = {
    ...createDefaultModel(),
    locale: resolveDefaultLocale()
  };

  if (props.operateType === 'edit' && props.rowData) {
    return {
      locale: props.rowData.locale,
      translationKey: props.rowData.translationKey,
      translationValue: props.rowData.translationValue,
      description: props.rowData.description,
      status: props.rowData.status
    };
  }

  return defaultModel;
}

async function submitLanguageTranslation(currentModel: Model) {
  const payload: Api.Language.TranslationPayload = {
    locale: (currentModel.locale || getDefaultLocale()) as App.I18n.LangType,
    translationKey: currentModel.translationKey.trim(),
    translationValue: currentModel.translationValue,
    description: currentModel.description.trim(),
    status: currentModel.status
  };

  return props.operateType === 'add'
    ? fetchCreateLanguageTranslation(payload, { handleValidationErrorLocally: true })
    : fetchUpdateLanguageTranslation(props.rowData?.id || 0, payload, {
        handleValidationErrorLocally: true
      });
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
        <NFormItemGi span="24 s:12" :label="$t('common.locale')" path="locale">
          <NInput v-if="isViewMode" :value="model.locale || ''" readonly />
          <NSelect
            v-else
            v-model:value="model.locale"
            filterable
            :options="localeOptions"
            :placeholder="$t('common.selectLocale')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('common.status')" path="status">
          <NTag v-if="isViewMode" :type="getEnableStatusTagType(model.status)">
            {{ getEnableStatusLabel(model.status) }}
          </NTag>
          <NRadioGroup v-else v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
          </NRadioGroup>
        </NFormItemGi>
        <NFormItemGi span="24" :label="$t('page.language.translationKey')" path="translationKey">
          <NInput
            v-model:value="model.translationKey"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.language.translationKeyPlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24" :label="$t('page.language.translationValue')" path="translationValue">
          <NInput
            v-model:value="model.translationValue"
            :readonly="isViewMode"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            :placeholder="isViewMode ? '' : $t('page.language.translationValuePlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24" :label="$t('common.description')" :show-require-mark="false">
          <NInput
            v-model:value="model.description"
            :readonly="isViewMode"
            type="textarea"
            :placeholder="isViewMode ? '' : $t('page.language.descriptionPlaceholder')"
          />
        </NFormItemGi>
      </NGrid>
    </NForm>
  </FormModalWrapper>
</template>

<style scoped></style>
