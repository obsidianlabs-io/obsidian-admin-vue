import { computed, ref } from 'vue';
import { getEnableStatusOptions } from '@/constants/common';
import { fetchGetAllRoles, fetchGetCrudSchema } from '@/service/api';
import { $t } from '@/locales';
import type { SchemaSearchField } from '@/types/schema-search-form';

interface UseCrudSchemaOptions {
  resource: string;
  fallbackSchema: Api.CrudSchema.Schema;
}

export function useCrudSchema(options: UseCrudSchemaOptions) {
  const loading = ref(false);
  const schema = ref<Api.CrudSchema.Schema>(options.fallbackSchema);
  const roleOptions = ref<CommonType.Option<string>[]>([]);

  async function loadSchema() {
    loading.value = true;
    const { data, error } = await fetchGetCrudSchema(options.resource);
    loading.value = false;

    if (!error && data) {
      schema.value = data;
    }
  }

  async function loadRoleOptions() {
    const hasRoleSource = schema.value.searchFields.some(field => field.optionSource === 'role.all');
    if (!hasRoleSource) {
      roleOptions.value = [];
      return;
    }

    roleOptions.value = [];

    const { data, error } = await fetchGetAllRoles();
    if (error || !data) {
      roleOptions.value = [];
      return;
    }

    roleOptions.value = data.records.map(item => ({
      label: item.roleName,
      value: item.roleCode
    }));
  }

  async function loadAll() {
    await loadSchema();
    await loadRoleOptions();
  }

  function resolveFieldOptions(optionSource?: string) {
    if (optionSource === 'status.enable') {
      return getEnableStatusOptions();
    }

    if (optionSource === 'role.all') {
      return roleOptions.value;
    }

    return [];
  }

  const searchFields = computed<SchemaSearchField<any>[]>(() => {
    return schema.value.searchFields.map(field => ({
      key: field.key,
      type: field.type,
      label: $t(field.labelKey),
      placeholder: field.placeholderKey ? $t(field.placeholderKey) : undefined,
      clearable: field.clearable ?? true,
      filterable: field.filterable ?? false,
      options: resolveFieldOptions(field.optionSource)
    }));
  });

  return {
    loading,
    schema,
    searchFields,
    loadSchema,
    loadRoleOptions,
    loadAll
  };
}
