<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateLanguageTranslation, fetchUpdateLanguageTranslation } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';
import { getDefaultLocale } from '@/locales/default-locale';

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

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const isViewMode = computed(() => Boolean(props.readOnly));
const enableStatusOptions = computed(() => getEnableStatusOptions());

const title = computed(() => {
  if (isViewMode.value) {
    return $t('page.language.viewTitle');
  }

  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.language.addTitle'),
    edit: $t('page.language.editTitle')
  };

  return titles[props.operateType];
});

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

const rules: Partial<Record<'locale' | 'translationKey' | 'translationValue' | 'status', App.Global.FormRule[]>> = {
  locale: [defaultRequiredRule],
  translationKey: [defaultRequiredRule],
  translationValue: [defaultRequiredRule],
  status: [defaultRequiredRule]
};

function resolveDefaultLocale(): App.I18n.LangType {
  if (props.rowData?.locale) {
    return props.rowData.locale;
  }

  return (props.localeOptions[0]?.value || getDefaultLocale()) as App.I18n.LangType;
}

function handleInitModel() {
  model.value = {
    ...createDefaultModel(),
    locale: resolveDefaultLocale()
  };

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      locale: props.rowData.locale,
      translationKey: props.rowData.translationKey,
      translationValue: props.rowData.translationValue,
      description: props.rowData.description,
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

  const payload: Api.Language.TranslationPayload = {
    locale: (model.value.locale || getDefaultLocale()) as App.I18n.LangType,
    translationKey: model.value.translationKey.trim(),
    translationValue: model.value.translationValue,
    description: model.value.description.trim(),
    status: model.value.status
  };

  const { error } =
    props.operateType === 'add'
      ? await fetchCreateLanguageTranslation(payload)
      : await fetchUpdateLanguageTranslation(props.rowData?.id || 0, payload);

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
