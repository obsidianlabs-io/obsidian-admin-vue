<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchForgotPassword, fetchResetPassword } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({
  name: 'ResetPwd'
});

const route = useRoute();
const { toggleLoginModule } = useRouterPush();
const naiveForm = useNaiveForm();
const { createConfirmPwdRule, createRequiredRule, formRules } = useFormRules();
const submitting = ref(false);
const resetStage = ref<'request' | 'reset'>('request');

interface FormModel {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

const model = ref<FormModel>({
  email: '',
  token: '',
  password: '',
  confirmPassword: ''
});

naiveForm.bindModelValidation(model, ['email', 'token', 'password', 'confirmPassword']);
const passwordValue = computed(() => model.value.password);

const isResetStage = computed(() => resetStage.value === 'reset');
const hasPrefilledToken = computed(() => model.value.token.trim().length > 0);

const baseRules = computed<Partial<Record<keyof FormModel, App.Global.FormRule | App.Global.FormRule[]>>>(() => ({
  email: formRules.email,
  token: isResetStage.value ? [createRequiredRule('form.required')] : [],
  password: isResetStage.value ? formRules.pwd : [],
  confirmPassword: isResetStage.value ? createConfirmPwdRule(passwordValue) : []
}));
const rules = naiveForm.withServerValidationRules(baseRules, ['email', 'token', 'password', 'confirmPassword']);

function syncResetContextFromRoute() {
  const queryEmail = typeof route.query.email === 'string' ? route.query.email.trim() : '';
  const queryToken = typeof route.query.token === 'string' ? route.query.token.trim() : '';

  if (queryEmail) {
    model.value.email = queryEmail;
  }

  if (queryToken) {
    model.value.token = queryToken;
    resetStage.value = 'reset';
  }
}

function switchToRequestStage() {
  resetStage.value = 'request';
  model.value.token = '';
  model.value.password = '';
  model.value.confirmPassword = '';
  naiveForm.restoreValidation();
}

async function requestResetToken() {
  await naiveForm.validate();

  submitting.value = true;

  const { data, error } = await fetchForgotPassword(
    {
      email: model.value.email.trim()
    },
    { handleValidationErrorLocally: true }
  );

  if (error) {
    await naiveForm.applyServerValidation(error);
    submitting.value = false;
    return;
  }

  if (data.resetToken) {
    model.value.token = data.resetToken.trim();
  }

  resetStage.value = 'reset';
  window.$message?.success($t('page.login.resetPwd.requestSuccess'));
  submitting.value = false;
}

async function submitResetPassword() {
  await naiveForm.validate();

  submitting.value = true;

  const { error } = await fetchResetPassword(
    {
      email: model.value.email.trim(),
      token: model.value.token.trim(),
      password: model.value.password,
      password_confirmation: model.value.confirmPassword
    },
    { handleValidationErrorLocally: true }
  );

  if (error) {
    await naiveForm.applyServerValidation(error, {
      fieldAliases: {
        password_confirmation: 'confirmPassword'
      }
    });
    submitting.value = false;
    return;
  }

  window.$message?.success($t('page.login.resetPwd.resetSuccess'));
  submitting.value = false;
  await toggleLoginModule('pwd-login');
}

async function handleSubmit() {
  if (isResetStage.value) {
    await submitResetPassword();
    return;
  }

  await requestResetToken();
}

watch(
  () => [route.query.email, route.query.token],
  () => {
    syncResetContextFromRoute();
  },
  { immediate: true }
);
</script>

<template>
  <NForm
    :ref="naiveForm.formRef"
    :model="model"
    :rules="rules"
    size="large"
    :show-label="false"
    @keyup.enter="handleSubmit"
  >
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
    </NFormItem>

    <template v-if="isResetStage">
      <NAlert type="info" :bordered="false" class="mb-18px">
        {{ hasPrefilledToken ? $t('page.login.resetPwd.prefilledTokenHint') : $t('page.login.resetPwd.tokenHint') }}
      </NAlert>

      <NFormItem path="token">
        <NInput v-model:value="model.token" :placeholder="$t('page.login.resetPwd.tokenPlaceholder')" />
      </NFormItem>
      <NFormItem path="password">
        <NInput
          v-model:value="model.password"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.passwordPlaceholder')"
        />
      </NFormItem>
      <NFormItem path="confirmPassword">
        <NInput
          v-model:value="model.confirmPassword"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
        />
      </NFormItem>
    </template>

    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block :loading="submitting" @click="handleSubmit">
        {{ isResetStage ? $t('page.login.resetPwd.submitReset') : $t('page.login.resetPwd.requestToken') }}
      </NButton>
      <NButton v-if="isResetStage" text type="primary" block @click="switchToRequestStage">
        {{ $t('page.login.resetPwd.requestNewToken') }}
      </NButton>
      <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
