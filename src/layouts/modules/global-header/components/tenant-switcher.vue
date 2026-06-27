<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { onKeyStroke } from '@vueuse/core';
import { NButton, NEmpty, NInput, NInputGroup, NModal, NScrollbar, NSpin } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { getNaiveMessage } from '@/utils/naive-ui';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'TenantSwitcher'
});

const authStore = useAuthStore();
const appStore = useAppStore();
const themeStore = useThemeStore();
const router = useRouter();

const switching = ref(false);
const searchQuery = ref('');
const modalVisible = ref(false);
const activeIndex = ref(0);
const searchInputRef = ref<any>(null);

const recentTenants = ref<{ tenantId: string; tenantName: string }[]>([]);

const isSuper = computed(() => authStore.userInfo.roles.includes('R_SUPER'));

const canViewTenant = computed(() => {
  if (!authStore.isLogin) {
    return false;
  }
  return authStore.userInfo.buttons.includes('tenant.view');
});

const showSwitcher = computed(() => {
  return !appStore.isMobile && isSuper.value && canViewTenant.value && authStore.userInfo.tenants.length > 0;
});

const currentTenantId = computed(() => authStore.userInfo.currentTenantId || '');
const currentTenantName = computed(() => {
  if (!currentTenantId.value) return $t('common.platform');
  const found = authStore.userInfo.tenants.find(t => t.tenantId === currentTenantId.value);
  return found ? found.tenantName : $t('common.tenant');
});

// Load recently visited tenants from localStorage
function loadRecentTenants() {
  try {
    const stored = localStorage.getItem('obsidian_recent_tenants');
    recentTenants.value = stored ? JSON.parse(stored) : [];
  } catch {
    recentTenants.value = [];
  }
}

// Save recently visited tenant
function saveRecentTenant(tenantId: string, tenantName: string) {
  if (!tenantId) return; // Don't cache system platform

  let list = [...recentTenants.value];
  list = list.filter(item => item.tenantId !== tenantId);
  list.unshift({ tenantId, tenantName });

  if (list.length > 3) {
    list = list.slice(0, 3);
  }
  recentTenants.value = list;
  localStorage.setItem('obsidian_recent_tenants', JSON.stringify(list));
}

// Compute filtered options
const filteredOptions = computed(() => {
  const keyword = searchQuery.value.toLowerCase().trim();
  const options: any[] = [];

  // Add system platform option if matches search
  const platformLabel = $t('common.platform');
  if (isSuper.value && (!keyword || platformLabel.toLowerCase().includes(keyword))) {
    options.push({
      label: platformLabel,
      key: '',
      icon: 'carbon:cloud-services',
      type: 'platform'
    });
  }

  // Filter and add tenant options
  const filtered = authStore.userInfo.tenants.filter(
    item => item.tenantName.toLowerCase().includes(keyword) || item.tenantId.toLowerCase().includes(keyword)
  );

  filtered.forEach(item => {
    options.push({
      label: item.tenantName,
      key: item.tenantId,
      icon: 'carbon:building',
      type: 'tenant'
    });
  });

  return options;
});

// Modal operations
function openModal() {
  if (switching.value) return;
  loadRecentTenants();
  searchQuery.value = '';
  activeIndex.value = 0;
  modalVisible.value = true;

  nextTick(() => {
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 150);
  });
}

function handleClose() {
  modalVisible.value = false;
}

function handleSearch() {
  activeIndex.value = 0;
}

// Select active option
async function handleSelect(key: string) {
  if (key === currentTenantId.value) {
    handleClose();
    return;
  }

  const selected = authStore.userInfo.tenants.find(t => t.tenantId === key);

  handleClose();
  switching.value = true;
  const pass = await authStore.switchTenant(key);
  switching.value = false;

  if (pass) {
    const switchedTo = key === '' ? $t('common.platform') : selected?.tenantName || $t('common.tenant');

    if (key && selected) {
      saveRecentTenant(selected.tenantId, selected.tenantName);
    }

    getNaiveMessage()?.success($t('common.switchTenantSuccess', { tenant: switchedTo }));

    router.push('/');
  }
}

// Keyboard controls
function handleUp() {
  const len = filteredOptions.value.length;
  if (len === 0) return;
  activeIndex.value = activeIndex.value === 0 ? len - 1 : activeIndex.value - 1;
}

function handleDown() {
  const len = filteredOptions.value.length;
  if (len === 0) return;
  activeIndex.value = activeIndex.value === len - 1 ? 0 : activeIndex.value + 1;
}

function handleEnter() {
  const len = filteredOptions.value.length;
  if (len === 0 || activeIndex.value < 0 || activeIndex.value >= len) return;
  const item = filteredOptions.value[activeIndex.value];
  handleSelect(item.key);
}

// Keyboard strokes with VueUse
onKeyStroke('ArrowUp', e => {
  if (modalVisible.value) {
    e.preventDefault();
    handleUp();
  }
});

onKeyStroke('ArrowDown', e => {
  if (modalVisible.value) {
    e.preventDefault();
    handleDown();
  }
});

onKeyStroke('Enter', e => {
  if (modalVisible.value) {
    e.preventDefault();
    handleEnter();
  }
});

onKeyStroke('Escape', e => {
  if (modalVisible.value) {
    e.preventDefault();
    handleClose();
  }
});

// Global shortcut Ctrl+Alt+T or Cmd+Opt+T
function handleGlobalShortcut(e: KeyboardEvent) {
  const isModifier = (e.ctrlKey && e.altKey) || (e.metaKey && e.altKey);
  if (isModifier && e.key.toLowerCase() === 't') {
    e.preventDefault();
    if (modalVisible.value) {
      handleClose();
    } else {
      openModal();
    }
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleGlobalShortcut);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalShortcut);
  }
});
</script>

<template>
  <div v-if="showSwitcher" class="mx-2 flex-y-center">
    <!-- Trigger Button -->
    <button
      class="group relative flex-center cursor-pointer gap-2 border border-transparent rd-full px-3 py-1.5 transition-all duration-300"
      :class="[
        themeStore.darkMode
          ? 'bg-primary/15 hover:bg-primary/25 border-primary/20 hover:border-primary/40'
          : 'bg-primary/10 hover:bg-primary/20 border-primary/15 hover:border-primary/30 text-primary-600',
        switching ? 'opacity-70 cursor-wait' : ''
      ]"
      :disabled="switching"
      @click="openModal"
    >
      <!-- Dynamic Icon Based on Current Type -->
      <div class="flex-center border-r border-primary/20 pr-2">
        <SvgIcon v-if="!currentTenantId" icon="carbon:cloud-services" class="text-16px text-primary" />
        <SvgIcon v-else icon="carbon:building" class="text-16px text-primary" />
      </div>

      <span class="max-w-120px truncate text-13px font-medium leading-none tracking-tight">
        {{ currentTenantName }}
      </span>

      <SvgIcon
        icon="carbon:chevron-down"
        class="ml-1 text-14px opacity-60 transition-transform duration-300 group-hover:rotate-180"
      />

      <!-- Loading overlay -->
      <span v-if="switching" class="absolute inset-0 flex-center rd-full bg-transparent backdrop-blur-[1px]">
        <NSpin :size="14" />
      </span>
    </button>

    <!-- Search Modal Dialog -->
    <NModal
      v-model:show="modalVisible"
      :segmented="{ footer: 'soft' }"
      :closable="false"
      preset="card"
      auto-focus
      footer-style="padding: 0; margin: 0"
      class="fixed left-0 right-0"
      :class="[appStore.isMobile ? 'size-full top-0px rounded-0' : 'w-630px top-50px']"
      @after-leave="handleClose"
    >
      <!-- Search Input Header -->
      <NInputGroup>
        <NInput
          ref="searchInputRef"
          v-model:value="searchQuery"
          clearable
          :placeholder="$t('common.keywordSearch')"
          @input="handleSearch"
        >
          <template #prefix>
            <SvgIcon icon="carbon:search" class="mr-1 text-16px text-#c2c2c2" />
          </template>
        </NInput>
        <NButton v-if="appStore.isMobile" type="primary" ghost @click="handleClose">
          {{ $t('common.cancel') }}
        </NButton>
      </NInputGroup>

      <!-- Recently Visited Section -->
      <div v-if="recentTenants.length > 0 && !searchQuery" class="mt-16px">
        <div class="mb-8px flex items-center gap-1 text-12px text-slate-400 font-bold">
          <SvgIcon icon="carbon:time" class="text-14px" />
          <span>最近切换</span>
        </div>
        <div class="flex flex-wrap gap-8px">
          <button
            v-for="item in recentTenants"
            :key="item.tenantId"
            class="flex cursor-pointer items-center gap-6px rounded-full bg-slate-100 px-10px py-6px text-12px text-slate-600 transition-all duration-300 dark:bg-dark-300 hover:bg-primary dark:text-slate-300 hover:text-white dark:hover:bg-primary dark:hover:text-white"
            @click="handleSelect(item.tenantId)"
          >
            <SvgIcon icon="carbon:building" class="text-12px" />
            <span>{{ item.tenantName }}</span>
          </button>
        </div>
      </div>

      <!-- Option List -->
      <div class="mt-20px">
        <NScrollbar class="max-h-380px">
          <div v-if="filteredOptions.length === 0" class="py-24px">
            <NEmpty :description="$t('common.noData')" />
          </div>
          <div v-else class="flex flex-col gap-6px pb-12px">
            <template v-for="(item, index) in filteredOptions" :key="item.key">
              <!-- Platform Section Label -->
              <div
                v-if="index === 0 && item.type === 'platform'"
                class="mb-6px mt-4px flex items-center gap-1.5 px-4px text-11px text-slate-400 font-bold tracking-wider uppercase dark:text-slate-500"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                <span>{{ $t('common.platform') || '系统平台' }}</span>
              </div>

              <!-- Tenant Section Label -->
              <div
                v-if="item.type === 'tenant' && (index === 0 || filteredOptions[index - 1].type === 'platform')"
                class="mb-6px mt-12px flex items-center gap-1.5 px-4px text-11px text-slate-400 font-bold tracking-wider uppercase dark:text-slate-500"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                <span>{{ $t('common.tenant') || '租户列表' }}</span>
              </div>

              <div
                class="flex cursor-pointer items-center justify-between border border-slate-100 rounded-6px px-14px py-10px transition-all duration-200 dark:border-slate-800"
                :class="[
                  item.key === currentTenantId
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-dark dark:hover:bg-dark-300',
                  index === activeIndex ? '!bg-primary text-white border-primary' : ''
                ]"
                @click="handleSelect(item.key)"
                @mouseenter="activeIndex = index"
              >
                <div class="flex items-center gap-10px">
                  <SvgIcon
                    :icon="item.icon"
                    class="text-18px"
                    :class="index === activeIndex ? 'text-white' : 'text-primary'"
                  />
                  <div class="flex flex-col">
                    <span
                      class="text-14px font-medium"
                      :class="index === activeIndex ? 'text-white' : 'text-slate-800 dark:text-slate-200'"
                    >
                      {{ item.label }}
                    </span>
                    <!-- Tenant ID under the name -->
                    <span
                      v-if="item.key"
                      class="mt-2px text-11px font-mono"
                      :class="index === activeIndex ? 'text-white/70' : 'text-slate-400'"
                    >
                      ID: {{ item.key }}
                    </span>
                  </div>
                </div>

                <!-- Active Badge on Right -->
                <div v-if="item.key === currentTenantId" class="flex items-center gap-1">
                  <span class="text-12px font-medium" :class="index === activeIndex ? 'text-white/80' : 'text-primary'">
                    当前
                  </span>
                  <SvgIcon
                    icon="carbon:checkmark-filled"
                    class="text-16px"
                    :class="index === activeIndex ? 'text-white' : 'text-primary'"
                  />
                </div>
              </div>
            </template>
          </div>
        </NScrollbar>
      </div>

      <!-- Footer Instructions -->
      <template #footer>
        <div
          v-if="!appStore.isMobile"
          class="h-44px flex items-center justify-between border-t border-slate-100 px-24px text-12px text-slate-400 dark:border-slate-800"
        >
          <div class="flex items-center gap-14px">
            <span class="flex items-center gap-4px">
              <kbd class="border rounded bg-slate-100 px-5px py-1px shadow-sm dark:bg-dark-200">↵</kbd>
              <span>{{ $t('common.confirm') }}</span>
            </span>
            <span class="flex items-center gap-4px">
              <kbd class="border rounded bg-slate-100 px-5px py-1px shadow-sm dark:bg-dark-200">↑</kbd>
              <kbd class="border rounded bg-slate-100 px-5px py-1px shadow-sm dark:bg-dark-200">↓</kbd>
              <span>{{ $t('common.switch') }}</span>
            </span>
            <span class="flex items-center gap-4px">
              <kbd class="border rounded bg-slate-100 px-5px py-1px shadow-sm dark:bg-dark-200">esc</kbd>
              <span>{{ $t('common.close') }}</span>
            </span>
          </div>
          <div class="flex items-center gap-4px">
            <span>快捷键:</span>
            <kbd class="border rounded bg-slate-100 px-5px py-1px text-10px shadow-sm dark:bg-dark-200">Ctrl+Alt+T</kbd>
          </div>
        </div>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
/* Relying on UnoCSS for primary styling to match the rest of the application. */
</style>
