<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { themeLayoutModeOptions, themePageAnimationModeOptions, themeScrollModeOptions } from '@/constants/app';
import { appEvent } from '@/constants/event';
import { fetchGetThemeConfig, fetchResetThemeConfig, fetchUpdateThemeConfig } from '@/service/api';
import { useAuth } from '@/hooks/business/auth';
import { translateOptions } from '@/utils/common';
import { applyThemeConfig, createDefaultThemeConfig, toThemeConfigPayload } from '@/utils/theme-config';
import { $t } from '@/locales';

defineOptions({
  name: 'ThemeConfigPage'
});

const { hasAuth } = useAuth();
const canManageTheme = computed(() => hasAuth('theme.manage'));

const loading = ref(false);
const saving = ref(false);
const resetting = ref(false);
const scopeName = ref('');
const version = ref(0);
const effectiveVersion = ref(0);
const savedSnapshot = ref('');

const model = reactive<Api.Theme.Config>(createDefaultThemeConfig());

const hasChanges = computed(() => {
  if (!savedSnapshot.value) return false;
  return JSON.stringify(toThemeConfigPayload(model)) !== savedSnapshot.value;
});

const hasSiderLayout = computed(() => model.layoutMode !== 'horizontal');
const showFixedHeaderAndTab = computed(() => model.scrollMode === 'wrapper');
const showPageAnimateMode = computed(() => model.pageAnimate);
const showFooterHeight = computed(() => model.footerVisible);

async function getData() {
  loading.value = true;

  const { data, error } = await fetchGetThemeConfig();

  if (!error) {
    scopeName.value = data.scopeName || '';
    version.value = Number(data.version || 0);
    effectiveVersion.value = Number(data.effectiveVersion || data.version || 0);
    applyThemeConfig(model, data.config);
    savedSnapshot.value = JSON.stringify(toThemeConfigPayload(model));
  }

  loading.value = false;
}

async function handleRefresh() {
  await getData();
}

async function handleUpdate() {
  if (!canManageTheme.value) {
    return;
  }

  saving.value = true;

  const { data, error } = await fetchUpdateThemeConfig(toThemeConfigPayload(model));

  if (!error) {
    scopeName.value = data.scopeName || scopeName.value;
    version.value = Number(data.version || version.value);
    effectiveVersion.value = Number(data.effectiveVersion || data.version || effectiveVersion.value);
    applyThemeConfig(model, data.config);
    savedSnapshot.value = JSON.stringify(toThemeConfigPayload(model));
    window.$message?.success($t('common.updateSuccess'));
    window.dispatchEvent(
      new CustomEvent(appEvent.themeConfigSync, { detail: { themeConfig: data.effectiveConfig || data.config } })
    );
  }

  saving.value = false;
}

async function handleReset() {
  if (!canManageTheme.value) {
    return;
  }

  resetting.value = true;

  const { data, error } = await fetchResetThemeConfig();

  if (!error) {
    scopeName.value = data.scopeName || scopeName.value;
    version.value = Number(data.version || version.value);
    effectiveVersion.value = Number(data.effectiveVersion || data.version || effectiveVersion.value);
    applyThemeConfig(model, data.config);
    savedSnapshot.value = JSON.stringify(toThemeConfigPayload(model));
    window.$message?.success($t('theme.configOperation.resetSuccessMsg'));
    window.dispatchEvent(
      new CustomEvent(appEvent.themeConfigSync, { detail: { themeConfig: data.effectiveConfig || data.config } })
    );
  }

  resetting.value = false;
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-x-hidden overflow-y-auto">
    <NCard :title="$t('route.theme-config')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <NSpace :size="8">
          <NButton size="small" :disabled="!canManageTheme || !hasChanges" :loading="resetting" @click="handleReset">
            <template #icon>
              <icon-mdi-restore class="text-icon" />
            </template>
            {{ $t('common.reset') }}
          </NButton>
          <NButton
            size="small"
            type="primary"
            :disabled="!canManageTheme || !hasChanges"
            :loading="saving"
            @click="handleUpdate"
          >
            <template #icon>
              <icon-mdi-content-save-edit-outline class="text-icon" />
            </template>
            {{ $t('common.update') }}
          </NButton>
          <NButton size="small" @click="handleRefresh">
            <template #icon>
              <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
        </NSpace>
      </template>

      <NSpin :show="loading">
        <NDescriptions label-placement="left" bordered :column="3" size="small" class="mb-16px">
          <NDescriptionsItem :label="$t('page.theme.scope')">
            <NTag type="info" size="small" :bordered="false">{{ scopeName || '-' }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.theme.version')">
            <NTag type="default" size="small" :bordered="false">v{{ version }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.theme.effectiveVersion')">
            <NTag type="success" size="small" :bordered="false">v{{ effectiveVersion }}</NTag>
          </NDescriptionsItem>
        </NDescriptions>

        <NForm label-placement="top">
          <NCollapse>
            <NCollapseItem :title="$t('theme.tabs.appearance')" name="appearance">
              <div class="form-row">
                <NFormItem :label="$t('theme.appearance.themeSchema.title')">
                  <NSelect
                    v-model:value="model.themeScheme"
                    :disabled="!canManageTheme"
                    :options="[
                      { label: $t('theme.appearance.themeSchema.light'), value: 'light' },
                      { label: $t('theme.appearance.themeSchema.dark'), value: 'dark' },
                      { label: $t('theme.appearance.themeSchema.auto'), value: 'auto' }
                    ]"
                  />
                </NFormItem>
                <NFormItem :label="$t('theme.appearance.themeColor.title')">
                  <NColorPicker
                    v-model:value="model.themeColor"
                    :disabled="!canManageTheme"
                    :show-alpha="false"
                    :modes="['hex']"
                    class="w-full"
                  />
                </NFormItem>
              </div>

              <div class="form-row">
                <NFormItem :label="$t('theme.appearance.themeRadius.title')">
                  <NInputNumber
                    v-model:value="model.themeRadius"
                    :disabled="!canManageTheme"
                    :min="0"
                    :max="16"
                    class="w-full"
                  />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem :title="$t('theme.tabs.layout')" name="layout">
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.layoutMode.title')">
                  <NSelect
                    v-model:value="model.layoutMode"
                    :disabled="!canManageTheme"
                    :options="translateOptions(themeLayoutModeOptions)"
                  />
                </NFormItem>
                <NFormItem :label="$t('theme.layout.content.scrollMode.title')">
                  <NSelect
                    v-model:value="model.scrollMode"
                    :disabled="!canManageTheme"
                    :options="translateOptions(themeScrollModeOptions)"
                  />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem v-if="hasSiderLayout" :title="$t('theme.layout.sider.title')" name="sider">
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.sider.width')">
                  <NInputNumber
                    v-model:value="model.siderWidth"
                    :disabled="!canManageTheme"
                    :min="180"
                    :max="320"
                    class="w-full"
                  />
                </NFormItem>
                <NFormItem :label="$t('theme.layout.sider.collapsedWidth')">
                  <NInputNumber
                    v-model:value="model.siderCollapsedWidth"
                    :disabled="!canManageTheme"
                    :min="48"
                    :max="120"
                    class="w-full"
                  />
                </NFormItem>
              </div>

              <div class="form-row">
                <NFormItem :label="$t('theme.layout.sider.inverted')">
                  <NSwitch v-model:value="model.darkSider" :disabled="!canManageTheme" />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem :title="$t('theme.layout.header.title')" name="header">
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.header.height')">
                  <NInputNumber
                    v-model:value="model.headerHeight"
                    :disabled="!canManageTheme"
                    :min="48"
                    :max="80"
                    class="w-full"
                  />
                </NFormItem>
                <NFormItem :label="$t('theme.layout.header.breadcrumb.visible')">
                  <NSwitch v-model:value="model.breadcrumbVisible" :disabled="!canManageTheme" />
                </NFormItem>
              </div>
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.header.fullscreenVisible')">
                  <NSwitch v-model:value="model.headerFullscreenVisible" :disabled="!canManageTheme" />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem :title="$t('theme.layout.tab.title')" name="tab">
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.tab.visible')">
                  <NSwitch v-model:value="model.tabVisible" :disabled="!canManageTheme" />
                </NFormItem>
                <NFormItem :label="$t('theme.layout.tab.fullscreenVisible')">
                  <NSwitch v-model:value="model.tabFullscreenVisible" :disabled="!canManageTheme" />
                </NFormItem>
              </div>
              <div class="form-row">
                <NFormItem v-if="showFixedHeaderAndTab" :label="$t('theme.layout.content.fixedHeaderAndTab')">
                  <NSwitch v-model:value="model.fixedHeaderAndTab" :disabled="!canManageTheme" />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem :title="$t('theme.layout.footer.title')" name="footer">
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.footer.visible')">
                  <NSwitch v-model:value="model.footerVisible" :disabled="!canManageTheme" />
                </NFormItem>
                <NFormItem v-if="showFooterHeight" :label="$t('theme.layout.footer.height')">
                  <NInputNumber
                    v-model:value="model.footerHeight"
                    :disabled="!canManageTheme || !model.footerVisible"
                    :min="32"
                    :max="96"
                    class="w-full"
                  />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem :title="$t('theme.layout.content.title')" name="content">
              <div class="form-row">
                <NFormItem :label="$t('theme.layout.content.page.animate')">
                  <NSwitch v-model:value="model.pageAnimate" :disabled="!canManageTheme" />
                </NFormItem>
                <NFormItem v-if="showPageAnimateMode" :label="$t('theme.layout.content.page.mode.title')">
                  <NSelect
                    v-model:value="model.pageAnimateMode"
                    :disabled="!canManageTheme || !model.pageAnimate"
                    :options="translateOptions(themePageAnimationModeOptions)"
                  />
                </NFormItem>
              </div>
            </NCollapseItem>

            <NCollapseItem :title="$t('theme.general.title')" name="general">
              <div class="form-row">
                <NFormItem :label="$t('theme.general.themeSchema.visible')">
                  <NSwitch v-model:value="model.themeSchemaVisible" :disabled="!canManageTheme" />
                </NFormItem>
                <NFormItem :label="$t('theme.general.multilingual.visible')">
                  <NSwitch v-model:value="model.multilingualVisible" :disabled="!canManageTheme" />
                </NFormItem>
              </div>

              <div class="form-row">
                <NFormItem :label="$t('theme.general.globalSearch.visible')">
                  <NSwitch v-model:value="model.globalSearchVisible" :disabled="!canManageTheme" />
                </NFormItem>
                <NFormItem :label="$t('theme.general.themeConfig.visible')">
                  <NSwitch v-model:value="model.themeConfigVisible" :disabled="!canManageTheme" />
                </NFormItem>
              </div>
            </NCollapseItem>
          </NCollapse>
        </NForm>
      </NSpin>
    </NCard>
  </div>
</template>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
