import { computed, nextTick, ref, toValue, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { FormInst } from 'naive-ui';
import { type ValidationErrorMap, resolveValidationErrors } from '@/service/request/validation';

export function useNaiveForm() {
  const formRef = ref<FormInst | null>(null);
  const serverValidationErrors = ref<ValidationErrorMap>({});

  async function validate() {
    clearServerValidationErrors();
    await formRef.value?.validate();
  }

  function clearServerValidationErrors(paths?: string | string[]) {
    if (!paths) {
      serverValidationErrors.value = {};
      return;
    }

    const targetPaths = Array.isArray(paths) ? paths : [paths];

    if (targetPaths.length === 0) {
      return;
    }

    serverValidationErrors.value = Object.fromEntries(
      Object.entries(serverValidationErrors.value).filter(([field]) => !targetPaths.includes(field))
    );
  }

  function createServerValidationRule(path: string): App.Global.FormRule {
    return {
      trigger: ['input', 'change', 'blur'],
      validator: () => {
        const message = serverValidationErrors.value[path]?.[0];

        return message ? new Error(message) : true;
      }
    };
  }

  function remapValidationErrors(
    fieldErrors: ValidationErrorMap,
    fieldAliases?: Partial<Record<string, string>>
  ): ValidationErrorMap {
    if (!fieldAliases || Object.keys(fieldAliases).length === 0) {
      return fieldErrors;
    }

    return Object.entries(fieldErrors).reduce<ValidationErrorMap>((acc, [field, messages]) => {
      const resolvedField = fieldAliases[field] || field;
      const existingMessages = acc[resolvedField] ?? [];
      const nextMessages = messages ?? [];

      acc[resolvedField] = [...existingMessages, ...nextMessages];

      return acc;
    }, {});
  }

  function withServerValidationRules<Fields extends string>(
    baseRules:
      | ComputedRef<Partial<Record<Fields, App.Global.FormRule | App.Global.FormRule[]>>>
      | Ref<Partial<Record<Fields, App.Global.FormRule | App.Global.FormRule[]>>>
      | Partial<Record<Fields, App.Global.FormRule | App.Global.FormRule[]>>,
    fields: readonly Fields[]
  ) {
    return computed<Partial<Record<Fields, App.Global.FormRule[]>>>(() => {
      const resolvedRules = toValue(baseRules);

      return fields.reduce<Partial<Record<Fields, App.Global.FormRule[]>>>((acc, field) => {
        const base = resolvedRules[field];
        let normalizedBase: App.Global.FormRule[] = [];

        if (Array.isArray(base)) {
          normalizedBase = [...base];
        } else if (base) {
          normalizedBase = [base];
        }

        acc[field] = [...normalizedBase, createServerValidationRule(field)];

        return acc;
      }, {});
    });
  }

  function bindModelValidation<Model extends Record<string, unknown>>(
    model: Ref<Model>,
    fields: readonly (keyof Model & string)[]
  ) {
    fields.forEach(field => {
      watch(
        () => model.value[field],
        () => {
          clearServerValidationErrors(field);
        }
      );
    });
  }

  async function applyServerValidation(
    error: unknown,
    options?: {
      fieldAliases?: Partial<Record<string, string>>;
    }
  ) {
    const fieldErrors = remapValidationErrors(resolveValidationErrors(error), options?.fieldAliases);

    if (Object.keys(fieldErrors).length === 0) {
      return false;
    }

    serverValidationErrors.value = fieldErrors;

    await nextTick();

    try {
      await formRef.value?.validate();
    } catch {
      // The form is expected to be invalid while surfacing server-side field errors.
    }

    return true;
  }

  function restoreValidation() {
    clearServerValidationErrors();
    formRef.value?.restoreValidation();
  }

  return {
    formRef,
    validate,
    applyServerValidation,
    bindModelValidation,
    clearServerValidationErrors,
    restoreValidation,
    serverValidationErrors,
    withServerValidationRules
  };
}
