<script setup lang="ts">
import { computed, ref } from 'vue';
import { fetchRegister } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const authStore = useAuthStore();
const naiveForm = useNaiveForm();
const { formRules, createConfirmPwdRule } = useFormRules();
const submitting = ref(false);

interface FormModel {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const model = ref<FormModel>({
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

naiveForm.bindModelValidation(model, ['userName', 'email', 'password', 'confirmPassword']);
const passwordValue = computed(() => model.value.password);

const baseRules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => ({
  userName: formRules.userName,
  email: formRules.email,
  password: formRules.pwd,
  confirmPassword: createConfirmPwdRule(passwordValue)
}));
const rules = naiveForm.withServerValidationRules(baseRules, ['userName', 'email', 'password', 'confirmPassword']);

async function handleSubmit() {
  await naiveForm.validate();

  submitting.value = true;

  const { data, error } = await fetchRegister(
    {
      name: model.value.userName.trim(),
      email: model.value.email.trim(),
      password: model.value.password
    },
    { handleValidationErrorLocally: true }
  );

  if (error) {
    await naiveForm.applyServerValidation(error, {
      fieldAliases: {
        name: 'userName'
      }
    });
    submitting.value = false;
    return;
  }

  const sessionEstablished = await authStore.establishSession(data, {
    redirect: true,
    rememberMe: false,
    showWelcomeNotification: false
  });

  if (sessionEstablished) {
    window.$notification?.success({
      title: $t('page.login.register.successTitle'),
      content: $t('page.login.register.successDesc'),
      duration: 4500
    });
    submitting.value = false;
    return;
  }

  window.$message?.success($t('page.login.register.successFallback'));
  submitting.value = false;
  await toggleLoginModule('pwd-login');
}
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
    <NFormItem path="userName">
      <NInput v-model:value="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
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
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block :loading="submitting" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
