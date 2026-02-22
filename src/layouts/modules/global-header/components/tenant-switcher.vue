<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { NInput } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({
  name: 'TenantSwitcher'
});

const authStore = useAuthStore();
const appStore = useAppStore();
const themeStore = useThemeStore();
const switching = ref(false);
const searchQuery = ref('');

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

// Function to render the search input inside the dropdown
function renderSearchInput() {
  return h(
    'div',
    { class: 'px-2 py-1' },
    h(NInput, {
      value: searchQuery.value,
      placeholder: $t('common.keywordSearch'),
      size: 'small',
      clearable: true,
      onUpdateValue: (val: string) => {
        searchQuery.value = val;
      },
      onClick: (e: MouseEvent) => {
        // Prevent clicking the search bar from closing the dropdown
        e.stopPropagation();
      }
    })
  );
}

// Build standard NDropdown options
const dropdownOptions = computed(() => {
  const keyword = searchQuery.value.toLowerCase();

  // Filter tenants based on search keyword
  const filteredTenants = authStore.userInfo.tenants.filter(item => item.tenantName.toLowerCase().includes(keyword));

  const options: any[] = [];

  // Add search input if there are more than 5 tenants total (or just always if preferred)
  if (authStore.userInfo.tenants.length > 5 || keyword) {
    options.push({
      key: 'search',
      type: 'render',
      render: renderSearchInput
    });
    options.push({ type: 'divider', key: 'd0' });
  }

  if (isSuper.value && (!keyword || $t('common.platform').toLowerCase().includes(keyword))) {
    options.push({
      label: $t('common.platform'),
      key: '',
      icon: () => h(SvgIcon, { icon: 'carbon:cloud-services' })
    });
  }

  if (isSuper.value && options.length > 0 && filteredTenants.length > 0) {
    // Only add a divider if there are actual elements before it
    const lastIsDivider = options.length > 0 && options[options.length - 1].type === 'divider';
    if (!lastIsDivider) {
      options.push({ type: 'divider', key: 'd1' });
    }
  }

  filteredTenants.forEach(item => {
    options.push({
      label: item.tenantName,
      key: item.tenantId,
      icon: () => h(SvgIcon, { icon: 'carbon:building' })
    });
  });

  // Edge case where filter returns nothing
  if (
    filteredTenants.length === 0 &&
    (!isSuper.value || (isSuper.value && !$t('common.platform').toLowerCase().includes(keyword)))
  ) {
    options.push({
      key: 'empty',
      disabled: true,
      label: $t('common.noData')
    });
  }

  return options;
});

async function handleSelect(key: string) {
  if (key === 'search' || key === 'empty' || key === authStore.userInfo.currentTenantId) {
    return;
  }

  switching.value = true;
  const pass = await authStore.switchTenant(key);
  switching.value = false;

  if (pass) {
    const switchedTo =
      key === ''
        ? $t('common.platform')
        : authStore.userInfo.tenants.find(item => item.tenantId === key)?.tenantName || $t('common.tenant');

    window.$message?.success($t('common.switchTenantSuccess', { tenant: switchedTo }));
  }
}
</script>

<template>
  <div v-if="showSwitcher" class="mx-2 flex-y-center">
    <!-- Dropdown to replace Select -->
    <NDropdown :options="dropdownOptions" placement="bottom" trigger="hover" @select="handleSelect">
      <button
        class="group flex-center cursor-pointer gap-2 border border-transparent rd-full px-3 py-1.5 transition-all duration-300"
        :class="[
          themeStore.darkMode
            ? 'bg-primary/15 hover:bg-primary/25 border-primary/20 hover:border-primary/40'
            : 'bg-primary/10 hover:bg-primary/20 border-primary/15 hover:border-primary/30 text-primary-600',
          switching ? 'opacity-70 cursor-wait' : ''
        ]"
        :disabled="switching"
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
    </NDropdown>
  </div>
</template>

<style scoped>
/* Relying on UnoCSS for primary styling to match the rest of the application. */
</style>
