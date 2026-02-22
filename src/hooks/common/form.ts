import { ref, toValue } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { FormInst } from 'naive-ui';
import { REG_CODE_SIX, REG_EMAIL, REG_PHONE, REG_PWD, REG_USER_NAME } from '@/constants/reg';
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

  async function validate() {
    await formRef.value?.validate();
  }

  async function restoreValidation() {
    formRef.value?.restoreValidation();
  }

  return {
    formRef,
    validate,
    restoreValidation
  };
}
