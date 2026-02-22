<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();
const emit = defineEmits<{
  (e: 'update:title', title: App.I18n.I18nKey | undefined): void;
}>();

interface FormModel {
  userName: string;
  password: string;
  rememberMe: boolean;
  otpCode: string;
}

const model: FormModel = reactive({
  userName: 'Super',
  password: '123456',
  rememberMe: true,
  otpCode: ''
});

const showOtpField = ref(false);

type FormRuleKey = 'userName' | 'password';

const rules = computed<Record<FormRuleKey, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd
  };
});

async function handleSubmit() {
  await validate();
  const result = await authStore.login(model.userName, model.password, {
    redirect: true,
    rememberMe: model.rememberMe,
    otpCode: model.otpCode
  });

  if (result === '2fa_required') {
    showOtpField.value = true;
  }
}

type AccountKey = 'super' | 'adminMain' | 'adminBranch' | 'userMain' | 'userBranch';

interface Account {
  key: AccountKey;
  label: string;
  userName: string;
  password: string;
}

const accounts = computed<Account[]>(() => [
  {
    key: 'super',
    label: $t('page.login.pwdLogin.superNoTenant'),
    userName: 'Super',
    password: '123456'
  },
  {
    key: 'adminMain',
    label: $t('page.login.pwdLogin.adminMain'),
    userName: 'Admin',
    password: '123456'
  },
  {
    key: 'adminBranch',
    label: $t('page.login.pwdLogin.adminBranch'),
    userName: 'AdminBranch',
    password: '123456'
  },
  {
    key: 'userMain',
    label: $t('page.login.pwdLogin.userMain'),
    userName: 'User',
    password: '123456'
  },
  {
    key: 'userBranch',
    label: $t('page.login.pwdLogin.userBranch'),
    userName: 'UserBranch',
    password: '123456'
  }
]);

async function handleAccountLogin(account: Account) {
  model.userName = account.userName;
  model.password = account.password;
  model.otpCode = '';

  const result = await authStore.login(account.userName, account.password, {
    redirect: true,
    rememberMe: model.rememberMe
  });

  if (result === '2fa_required') {
    showOtpField.value = true;
    emit('update:title', 'page.login.pwdLogin.twoFactorOtpPlaceholder');
  }
}

function handleBack() {
  showOtpField.value = false;
  emit('update:title', undefined);
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem v-show="!showOtpField" path="userName">
      <NInput v-model:value="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem v-show="!showOtpField" path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NFormItem v-if="showOtpField" path="otpCode">
      <NInput
        v-model:value="model.otpCode"
        :placeholder="$t('page.login.pwdLogin.twoFactorOtpPlaceholder')"
        autofocus
      />
    </NFormItem>
    <template v-if="!showOtpField">
      <NSpace vertical :size="24" class="w-full">
        <div class="flex-y-center justify-between">
          <NCheckbox v-model:checked="model.rememberMe">{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        </div>

        <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>

        <NDivider class="text-14px text-#666 !m-0">{{ $t('page.login.pwdLogin.otherAccountLogin') }}</NDivider>
        <div class="flex-center flex-wrap gap-12px">
          <NButton v-for="item in accounts" :key="item.key" type="primary" @click="handleAccountLogin(item)">
            {{ item.label }}
          </NButton>
        </div>
      </NSpace>
    </template>

    <template v-else>
      <NSpace vertical :size="18" class="w-full">
        <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
        <NButton size="large" round block @click="handleBack">
          {{ $t('page.login.common.back') }}
        </NButton>
      </NSpace>
    </template>
  </NForm>
</template>

<style scoped></style>
