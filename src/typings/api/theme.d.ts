declare namespace Api {
  /**
   * namespace Theme
   *
   * backend api module: "theme"
   */
  namespace Theme {
    interface Config {
      themeScheme: UnionKey.ThemeScheme;
      themeColor: string;
      themeRadius: number;
      headerHeight: number;
      siderWidth: number;
      siderCollapsedWidth: number;
      layoutMode: UnionKey.ThemeLayoutMode;
      scrollMode: UnionKey.ThemeScrollMode;
      darkSider: boolean;
      themeSchemaVisible: boolean;
      headerFullscreenVisible: boolean;
      tabVisible: boolean;
      tabFullscreenVisible: boolean;
      breadcrumbVisible: boolean;
      footerVisible: boolean;
      footerHeight: number;
      multilingualVisible: boolean;
      globalSearchVisible: boolean;
      themeConfigVisible: boolean;
      pageAnimate: boolean;
      pageAnimateMode: UnionKey.ThemePageAnimateMode;
      fixedHeaderAndTab: boolean;
    }

    interface ScopeConfigPayload {
      scopeType: 'platform';
      scopeId: string;
      scopeName: string;
      version: number;
      config: Config;
      effectiveConfig?: Config;
      effectiveVersion?: number;
      editable?: boolean;
    }
  }
}
