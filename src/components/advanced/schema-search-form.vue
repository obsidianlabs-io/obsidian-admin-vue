<script setup lang="ts">
import { useSearchFormActions } from '@/hooks/business/search-form';
import { $t } from '@/locales';
import type { SchemaSearchField } from '@/types/schema-search-form';

defineOptions({
  name: 'SchemaSearchForm'
});

interface Props {
  fields: SchemaSearchField<any>[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();
const model = defineModel<Record<string, any>>('model', { required: true });
const { reset, search } = useSearchFormActions(model, () => emit('search'));

function getFieldValue(key: string) {
  return (model.value as Record<string, any>)[key];
}

function setFieldValue(key: string, value: any) {
  (model.value as Record<string, any>)[key] = value;
}

function onInputEnter(field: SchemaSearchField<any>) {
  if (field.type !== 'input') {
    return;
  }

  search();
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="props.title || $t('common.search')" name="schema-search">
        <NForm label-placement="top" :show-feedback="false">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              v-for="field in props.fields"
              :key="field.key"
              :span="field.span || '24 s:12 m:6'"
              :label="field.label"
              class="pr-24px"
            >
              <NInput
                v-if="field.type === 'input'"
                :value="getFieldValue(field.key)"
                :clearable="field.clearable ?? true"
                :placeholder="field.placeholder"
                @update:value="value => setFieldValue(field.key, value)"
                @keyup.enter="onInputEnter(field)"
              />
              <NSelect
                v-else-if="field.type === 'select'"
                :value="getFieldValue(field.key)"
                :clearable="field.clearable ?? true"
                :filterable="field.filterable ?? false"
                :options="field.options || []"
                :placeholder="field.placeholder"
                @update:value="value => setFieldValue(field.key, value)"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-mdi-restore class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
