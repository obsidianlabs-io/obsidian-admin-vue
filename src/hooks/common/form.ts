import { computed, nextTick, ref, toValue, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { FormInst } from 'naive-ui';
import { REG_CODE_SIX, REG_EMAIL, REG_PHONE, REG_PWD, REG_USER_NAME } from '@/constants/reg';
import { type ValidationErrorMap, resolveValidationErrors } from '@/service/request/shared';
import { $t } from '@/locales';

export function useFormRules() {
  function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim() === '';
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return false;
  }

  function createPatternRule(pattern: RegExp, messageKey: App.I18n.I18nKey): App.Global.FormRule {
    return {
      trigger: 'change',
      validator: (_, value) => {
        if (isEmptyValue(value)) {
          return true;
        }

        return pattern.test(String(value).trim()) || new Error($t(messageKey));
      }
    };
  }

  const patternRules = {
    userName: createPatternRule(REG_USER_NAME, 'form.userName.invalid'),
    phone: createPatternRule(REG_PHONE, 'form.phone.invalid'),
    pwd: createPatternRule(REG_PWD, 'form.pwd.invalid'),
    code: createPatternRule(REG_CODE_SIX, 'form.code.invalid'),
    email: createPatternRule(REG_EMAIL, 'form.email.invalid')
  } satisfies Record<string, App.Global.FormRule>;

  const formRules = {
    userName: [createRequiredRule('form.userName.required'), patternRules.userName],
    phone: [createRequiredRule('form.phone.required'), patternRules.phone],
    pwd: [createRequiredRule('form.pwd.required'), patternRules.pwd],
    code: [createRequiredRule('form.code.required'), patternRules.code],
    email: [createRequiredRule('form.email.required'), patternRules.email]
  } satisfies Record<string, App.Global.FormRule[]>;

  /** the default required rule */
  const defaultRequiredRule = createRequiredRule('form.required');

  function createRequiredRule(messageKey: App.I18n.I18nKey): App.Global.FormRule {
    return {
      required: true,
      trigger: ['input', 'blur', 'change'],
      asyncValidator: (_, value) => {
        if (isEmptyValue(value)) {
          return Promise.reject(new Error($t(messageKey)));
        }

        return Promise.resolve();
      }
    };
  }

  /** create a rule for confirming the password */
  function createConfirmPwdRule(pwd: string | Ref<string> | ComputedRef<string>) {
    const confirmPwdRule: App.Global.FormRule[] = [
      createRequiredRule('form.confirmPwd.required'),
      {
        asyncValidator: (_, value) => {
          if (String(value).trim() !== '' && value !== toValue(pwd)) {
            return Promise.reject(new Error($t('form.confirmPwd.invalid')));
          }
          return Promise.resolve();
        },
        trigger: 'input'
      }
    ];
    return confirmPwdRule;
  }

  return {
    patternRules,
    formRules,
    defaultRequiredRule,
    createRequiredRule,
    createConfirmPwdRule
  };
}

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

  async function applyServerValidation(error: unknown) {
    const fieldErrors = resolveValidationErrors(error);

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
