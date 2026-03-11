<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';
import type { Component } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { $t } from '@/locales';
import PwdLogin from '../modules/pwd-login.vue';

defineOptions({
  name: 'DemoLoginPage'
});

const Register = defineAsyncComponent(() => import('../modules/register.vue'));
const ResetPwd = defineAsyncComponent(() => import('../modules/reset-pwd.vue'));

interface Props {
  module?: UnionKey.LoginModule;
}

const props = defineProps<Props>();

interface LoginModule {
  label: App.I18n.I18nKey;
  component: Component;
}

const moduleMap: Record<'pwd-login' | 'register' | 'reset-pwd', LoginModule> = {
  'pwd-login': { label: loginModuleRecord['pwd-login'], component: PwdLogin },
  register: { label: loginModuleRecord.register, component: Register },
  'reset-pwd': { label: loginModuleRecord['reset-pwd'], component: ResetPwd }
};

const customTitle = ref<App.I18n.I18nKey | undefined>(undefined);
const activeModule = computed(() => {
  const module = props.module;

  if (module === 'register' || module === 'reset-pwd') {
    return moduleMap[module];
  }

  return moduleMap['pwd-login'];
});
const displayTitle = computed(() => customTitle.value || activeModule.value.label);

function handleUpdateTitle(title?: App.I18n.I18nKey) {
  customTitle.value = title;
}
</script>

<template>
  <div class="relative min-h-screen flex-center overflow-hidden bg-[#f4f7fb] px-16px py-32px">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%)]"></div>
    <div class="absolute inset-x-0 top-0 h-220px bg-[linear-gradient(180deg,_rgba(15,23,42,0.04),_transparent)]"></div>
    <NCard :bordered="false" class="relative z-1 max-w-full w-400px rd-16px">
      <div>
        <header class="flex flex-col items-center gap-12px">
          <SystemLogo class="size-64px" />
          <div class="text-center">
            <h1 class="text-28px text-primary font-600">{{ $t('system.title') }}</h1>
            <p class="mt-8px text-14px text-[#64748b]">
              {{ $t('page.login.pwdLogin.demoRuntimeHint') }}
            </p>
          </div>
        </header>
        <main class="pt-24px">
          <h3 class="text-18px text-[#1e3a8a] font-medium">{{ $t(displayTitle) }}</h3>
          <div class="pt-24px">
            <Transition name="fade" mode="out-in" appear>
              <component :is="activeModule.component" @update:title="handleUpdateTitle" />
            </Transition>
          </div>
        </main>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
:deep(.n-card) {
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.1),
    0 8px 24px rgba(15, 23, 42, 0.06);
}
</style>
