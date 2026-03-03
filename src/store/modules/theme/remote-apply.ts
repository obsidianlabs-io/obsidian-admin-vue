import type { Ref } from 'vue';
import {
  applyBooleanSetting,
  applyEnumSetting,
  clampInteger,
  isLayoutMode,
  isPageAnimateMode,
  isScrollMode,
  isThemeScheme
} from './remote-utils';

interface ThemeSyncContext {
  settings: Ref<App.Theme.ThemeSetting>;
  applyingRemoteThemeScheme: Ref<boolean>;
  lastSyncedThemeScheme: Ref<UnionKey.ThemeScheme | null>;
}

export function applyRemoteThemeSchema(context: ThemeSyncContext, themeSchema?: UnionKey.ThemeScheme | null) {
  if (!isThemeScheme(themeSchema)) {
    return;
  }

  context.applyingRemoteThemeScheme.value = true;
  context.lastSyncedThemeScheme.value = themeSchema;
  context.settings.value.themeScheme = themeSchema;

  queueMicrotask(() => {
    context.applyingRemoteThemeScheme.value = false;
  });
}

export function applyRemoteThemeConfig(context: ThemeSyncContext, config?: Api.Theme.Config | null) {
  if (!config) {
    return;
  }

  context.applyingRemoteThemeScheme.value = true;

  applyEnumSetting(config.themeScheme, isThemeScheme, nextThemeScheme => {
    context.settings.value.themeScheme = nextThemeScheme;
    context.lastSyncedThemeScheme.value = nextThemeScheme;
  });

  const nextThemeColor = String(config.themeColor || '').trim();
  if (/^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(nextThemeColor)) {
    context.settings.value.themeColor = nextThemeColor;
  }

  const themeRadius = clampInteger(config.themeRadius, 0, 16);
  if (themeRadius !== null) {
    context.settings.value.themeRadius = themeRadius;
  }

  const headerHeight = clampInteger(config.headerHeight, 48, 80);
  if (headerHeight !== null) {
    context.settings.value.header.height = headerHeight;
  }

  const siderWidth = clampInteger(config.siderWidth, 180, 320);
  if (siderWidth !== null) {
    context.settings.value.sider.width = siderWidth;
  }

  const siderCollapsedWidth = clampInteger(config.siderCollapsedWidth, 48, 120);
  if (siderCollapsedWidth !== null) {
    context.settings.value.sider.collapsedWidth = siderCollapsedWidth;
  }

  const footerHeight = clampInteger(config.footerHeight, 32, 96);
  if (footerHeight !== null) {
    context.settings.value.footer.height = footerHeight;
  }

  applyEnumSetting(config.layoutMode, isLayoutMode, nextMode => {
    context.settings.value.layout.mode = nextMode;
  });

  applyEnumSetting(config.scrollMode, isScrollMode, nextScrollMode => {
    context.settings.value.layout.scrollMode = nextScrollMode;
  });

  applyEnumSetting(config.pageAnimateMode, isPageAnimateMode, nextPageAnimateMode => {
    context.settings.value.page.animateMode = nextPageAnimateMode;
  });

  applyBooleanSetting(config.darkSider, next => {
    context.settings.value.sider.inverted = next;
  });
  applyBooleanSetting(config.themeSchemaVisible, next => {
    context.settings.value.header.themeSchema.visible = next;
  });
  applyBooleanSetting(config.headerFullscreenVisible, next => {
    context.settings.value.header.fullscreen.visible = next;
  });
  applyBooleanSetting(config.tabVisible, next => {
    context.settings.value.tab.visible = next;
  });
  applyBooleanSetting(config.tabFullscreenVisible, next => {
    context.settings.value.tab.fullscreen.visible = next;
  });
  applyBooleanSetting(config.breadcrumbVisible, next => {
    context.settings.value.header.breadcrumb.visible = next;
  });
  applyBooleanSetting(config.footerVisible, next => {
    context.settings.value.footer.visible = next;
  });
  applyBooleanSetting(config.multilingualVisible, next => {
    context.settings.value.header.multilingual.visible = next;
  });
  applyBooleanSetting(config.globalSearchVisible, next => {
    context.settings.value.header.globalSearch.visible = next;
  });
  applyBooleanSetting(config.themeConfigVisible, next => {
    context.settings.value.header.themeConfig.visible = next;
  });
  applyBooleanSetting(config.pageAnimate, next => {
    context.settings.value.page.animate = next;
  });
  applyBooleanSetting(config.fixedHeaderAndTab, next => {
    context.settings.value.fixedHeaderAndTab = next;
  });

  queueMicrotask(() => {
    context.applyingRemoteThemeScheme.value = false;
  });
}
