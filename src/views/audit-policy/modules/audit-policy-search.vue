<script setup lang="ts">
import { computed } from 'vue';
import SchemaSearchForm from '@/components/advanced/schema-search-form.vue';
import { $t } from '@/locales';
import type { SchemaSearchField } from '@/types/schema-search-form';
import type { AuditPolicySearchModel } from '../composables/use-audit-policy';

defineOptions({
  name: 'AuditPolicySearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();
const model = defineModel<AuditPolicySearchModel>('model', { required: true });

const fields = computed<SchemaSearchField<AuditPolicySearchModel>[]>(() => [
  {
    key: 'keyword',
    type: 'input',
    label: $t('common.keyword'),
    placeholder: $t('page.auditPolicy.filterActionPlaceholder')
  },
  {
    key: 'category',
    type: 'select',
    label: $t('page.auditPolicy.filterCategory'),
    placeholder: $t('page.auditPolicy.filterAllCategories'),
    options: [
      { label: $t('page.auditPolicy.categoryMandatory'), value: 'mandatory' },
      { label: $t('page.auditPolicy.categoryOptional'), value: 'optional' }
    ]
  },
  {
    key: 'locked',
    type: 'select',
    label: $t('page.auditPolicy.filterLock'),
    placeholder: $t('page.auditPolicy.filterAllLockStates'),
    options: [
      { label: $t('page.auditPolicy.filterLockedOnly'), value: 'locked' },
      { label: $t('page.auditPolicy.filterEditableOnly'), value: 'editable' }
    ]
  },
  {
    key: 'changeScope',
    type: 'select',
    label: $t('page.auditPolicy.filterChangeScope'),
    placeholder: $t('page.auditPolicy.filterShowAll'),
    options: [
      { label: $t('page.auditPolicy.filterShowAll'), value: 'all' },
      { label: $t('page.auditPolicy.showChangedOnly'), value: 'changed' }
    ]
  }
]);
</script>

<template>
  <SchemaSearchForm v-model:model="model" :fields="fields" @search="emit('search')" />
</template>

<style scoped></style>
