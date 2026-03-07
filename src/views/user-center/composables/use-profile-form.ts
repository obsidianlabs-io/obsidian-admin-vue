import { computed, reactive, ref } from 'vue';
import { REG_PWD } from '@/constants/reg';
import { fetchGetTimezoneOptions, fetchGetUserProfile, fetchUpdateUserProfile } from '@/service/api';
import type { useAuthStore } from '@/store/modules/auth';
import type { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

interface Model {
  userName: string;
  email: string;
  timezone: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

type FormRuleKey = keyof Model;

interface UseProfileFormOptions {
  authStore: ReturnType<typeof useAuthStore>;
  naiveForm: ReturnType<typeof useNaiveForm>;
  formRules: ReturnType<typeof useFormRules>['formRules'];
}

export function useProfileForm(options: UseProfileFormOptions) {
  const { authStore, naiveForm, formRules } = options;

  const loading = ref(false);
  const submitting = ref(false);
  const profile = ref<Api.Auth.UserProfile | null>(null);
  const timezoneOptions = ref<CommonType.Option<string>[]>([]);

  const model = reactive<Model>({
    userName: '',
    email: '',
    timezone: 'UTC',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  naiveForm.bindModelValidation(ref(model), ['userName', 'email', 'currentPassword', 'password', 'confirmPassword']);

  const hasChanges = computed(() => {
    if (!profile.value) return false;

    const currentProfile = profile.value;

    return (
      model.userName !== currentProfile.userName ||
      model.email !== currentProfile.email ||
      model.timezone !== (currentProfile.timezone || 'UTC') ||
      model.currentPassword !== '' ||
      model.password !== '' ||
      model.confirmPassword !== ''
    );
  });

  const baseRules = computed<Record<FormRuleKey, App.Global.FormRule[]>>(() => {
    return {
      userName: formRules.userName,
      email: formRules.email,
      timezone: [],
      currentPassword: [
        {
          asyncValidator: (rule, value) => {
            if (model.password !== '' && String(value) === '') {
              return Promise.reject(rule.message);
            }

            return Promise.resolve();
          },
          message: $t('page.userCenter.currentPasswordRequired'),
          trigger: ['blur', 'input']
        }
      ],
      password: [
        {
          asyncValidator: (rule, value) => {
            const password = String(value);
            if (password === '') {
              return Promise.resolve();
            }

            if (!REG_PWD.test(password)) {
              return Promise.reject(rule.message);
            }

            return Promise.resolve();
          },
          message: $t('form.pwd.invalid'),
          trigger: ['blur', 'input']
        }
      ],
      confirmPassword: [
        {
          asyncValidator: (rule, value) => {
            const password = model.password;
            const confirmPassword = String(value);

            if (password === '' && confirmPassword === '') {
              return Promise.resolve();
            }

            if (password === '' && confirmPassword !== '') {
              return Promise.reject(rule.message);
            }

            if (password !== confirmPassword) {
              return Promise.reject(rule.message);
            }

            return Promise.resolve();
          },
          message: $t('form.confirmPwd.invalid'),
          trigger: ['blur', 'input']
        }
      ]
    };
  });
  const rules = naiveForm.withServerValidationRules(baseRules, [
    'userName',
    'email',
    'currentPassword',
    'password',
    'confirmPassword'
  ] as const);

  function resetPasswordFields() {
    model.currentPassword = '';
    model.password = '';
    model.confirmPassword = '';
  }

  function applyProfileToModel(data: Api.Auth.UserProfile) {
    profile.value = data;
    model.userName = data.userName;
    model.email = data.email;
    model.timezone = data.timezone || 'UTC';
    resetPasswordFields();
  }

  function resetProfileForm() {
    if (!profile.value) {
      return;
    }

    model.userName = profile.value.userName;
    model.email = profile.value.email;
    model.timezone = profile.value.timezone || 'UTC';
    resetPasswordFields();
    naiveForm.restoreValidation();
  }

  async function getProfile() {
    loading.value = true;
    try {
      const { data, error } = await fetchGetUserProfile();

      if (!error) {
        applyProfileToModel(data);
      }
    } finally {
      loading.value = false;
    }
  }

  async function getTimezoneOptions() {
    const { data, error } = await fetchGetTimezoneOptions();

    if (error) {
      timezoneOptions.value = [];
      return;
    }

    timezoneOptions.value = data.records.map(item => ({
      label: item.label,
      value: item.timezone
    }));

    if (!model.timezone && data.defaultTimezone) {
      model.timezone = data.defaultTimezone;
    }
  }

  async function handleSubmit() {
    await naiveForm.validate();

    submitting.value = true;
    try {
      const payload: Api.Auth.UpdateProfilePayload = {
        userName: model.userName.trim(),
        email: model.email.trim()
      };

      const password = model.password;
      if (password !== '') {
        payload.currentPassword = model.currentPassword;
        payload.password = password;
        payload.password_confirmation = model.confirmPassword;
      }

      const nextTimezone = model.timezone.trim();
      if (nextTimezone !== '') {
        payload.timezone = nextTimezone;
      }

      const { data, error } = await fetchUpdateUserProfile(payload, {
        handleValidationErrorLocally: true
      });

      if (error) {
        await naiveForm.applyServerValidation(error, {
          fieldAliases: {
            password_confirmation: 'confirmPassword'
          }
        });
        return;
      }

      applyProfileToModel(data);
      await authStore.initUserInfo();
      naiveForm.restoreValidation();
      window.$message?.success($t('common.updateSuccess'));
    } finally {
      submitting.value = false;
    }
  }

  return {
    loading,
    submitting,
    profile,
    timezoneOptions,
    model,
    rules,
    hasChanges,
    resetProfileForm,
    getProfile,
    getTimezoneOptions,
    handleSubmit
  };
}
