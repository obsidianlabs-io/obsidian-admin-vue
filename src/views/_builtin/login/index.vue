<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { getPaletteColorByNumber } from '@sa/color';
import { loginModuleRecord } from '@/constants/app';
import { fetchGetPublicThemeConfig } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import PwdLogin from './modules/pwd-login.vue';
import ResetPwd from './modules/reset-pwd.vue';
import BindWechat from './modules/bind-wechat.vue';

interface Props {
  /** The login module */
  module?: UnionKey.LoginModule;
}

const props = defineProps<Props>();

const appStore = useAppStore();
const themeStore = useThemeStore();
const loginThemeReady = ref(false);

interface LoginModule {
  label: App.I18n.I18nKey;
  component: Component;
}

const moduleMap: Partial<Record<UnionKey.LoginModule, LoginModule>> = {
  'pwd-login': { label: loginModuleRecord['pwd-login'], component: PwdLogin },
  'reset-pwd': { label: loginModuleRecord['reset-pwd'], component: ResetPwd },
  'bind-wechat': { label: loginModuleRecord['bind-wechat'], component: BindWechat }
};

const activeModule = computed(() => moduleMap[props.module || 'pwd-login'] || moduleMap['pwd-login']!);
const showThemeSchemaSwitch = computed(() => loginThemeReady.value && themeStore.header.themeSchema.visible);
const showLangSwitch = computed(() => loginThemeReady.value && themeStore.header.multilingual.visible);
const showHeaderActions = computed(() => showThemeSchemaSwitch.value || showLangSwitch.value);

const customTitle = ref<App.I18n.I18nKey | undefined>(undefined);
const displayTitle = computed(() => customTitle.value || activeModule.value.label);

const bgThemeColor = computed(() =>
  themeStore.darkMode ? getPaletteColorByNumber(themeStore.themeColor, 600) : themeStore.themeColor
);

const bgColor = computed(() => {
  return 'transparent';
});

async function loadPublicThemeConfig() {
  try {
    const { data, error } = await fetchGetPublicThemeConfig();

    if (!error && data) {
      themeStore.applyRemoteThemeConfig(data.effectiveConfig || data.config);
    }
  } catch {
    // Keep login available even if the public theme config endpoint is temporarily unavailable.
  }
}

function handleUpdateTitle(title?: App.I18n.I18nKey) {
  customTitle.value = title;
}

onMounted(async () => {
  await loadPublicThemeConfig();
  loginThemeReady.value = true;
});
</script>

<template>
  <div class="relative size-full flex-center overflow-hidden" :style="{ backgroundColor: bgColor }">
    <WaveBg :theme-color="bgThemeColor" />
    <NCard :bordered="false" class="login-card relative z-4 w-auto rd-16px">
      <div class="w-400px lt-sm:w-300px">
        <header class="grid grid-cols-[64px_1fr_64px] items-center lt-sm:grid-cols-[48px_1fr_48px]">
          <div class="flex items-center justify-start">
            <SystemLogo class="size-64px lt-sm:size-48px" />
          </div>
          <h3 class="text-center text-28px text-primary font-500 lt-sm:text-22px">{{ $t('system.title') }}</h3>
          <div class="flex items-center justify-end">
            <div v-if="showHeaderActions" class="i-flex-col">
              <ThemeSchemaSwitch
                v-if="showThemeSchemaSwitch"
                :theme-schema="themeStore.themeScheme"
                :show-tooltip="false"
                class="text-20px lt-sm:text-18px"
                @switch="themeStore.toggleThemeScheme"
              />
              <LangSwitch
                v-if="showLangSwitch"
                :lang="appStore.locale"
                :lang-options="appStore.localeOptions"
                :show-tooltip="false"
                @change-lang="appStore.changeLocale"
              />
            </div>
          </div>
        </header>
        <main class="pt-24px">
          <h3 class="text-18px text-primary font-medium">{{ $t(displayTitle) }}</h3>
          <div class="pt-24px">
            <Transition :name="themeStore.page.animateMode" mode="out-in" appear>
              <component :is="activeModule.component" @update:title="handleUpdateTitle" />
            </Transition>
          </div>
        </main>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.login-card {
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.dark .login-card {
  background: rgba(30, 30, 46, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2) !important;
}
</style>
