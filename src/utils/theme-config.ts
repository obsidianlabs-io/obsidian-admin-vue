import { themeSettings } from '@/theme/settings';

export function createDefaultThemeConfig(): Api.Theme.Config {
  return {
    themeScheme: themeSettings.themeScheme,
    themeColor: themeSettings.themeColor,
    themeRadius: themeSettings.themeRadius,
    headerHeight: themeSettings.header.height,
    siderWidth: themeSettings.sider.width,
    siderCollapsedWidth: themeSettings.sider.collapsedWidth,
    layoutMode: themeSettings.layout.mode,
    scrollMode: themeSettings.layout.scrollMode,
    darkSider: themeSettings.sider.inverted,
    themeSchemaVisible: themeSettings.header.themeSchema.visible,
    headerFullscreenVisible: themeSettings.header.fullscreen.visible,
    tabVisible: themeSettings.tab.visible,
    tabFullscreenVisible: themeSettings.tab.fullscreen.visible,
    breadcrumbVisible: themeSettings.header.breadcrumb.visible,
    footerVisible: themeSettings.footer.visible,
    footerHeight: themeSettings.footer.height,
    multilingualVisible: themeSettings.header.multilingual.visible,
    globalSearchVisible: themeSettings.header.globalSearch.visible,
    themeConfigVisible: themeSettings.header.themeConfig.visible,
    pageAnimate: themeSettings.page.animate,
    pageAnimateMode: themeSettings.page.animateMode,
    fixedHeaderAndTab: themeSettings.fixedHeaderAndTab
  };
}

export function applyThemeConfig(target: Api.Theme.Config, source?: Partial<Api.Theme.Config> | null) {
  if (!source) {
    return;
  }

  Object.assign(target, source);
}

export function toThemeConfigPayload(source: Api.Theme.Config): Api.Theme.Config {
  return { ...source };
}
