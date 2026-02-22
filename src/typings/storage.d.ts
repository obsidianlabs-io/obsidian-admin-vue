/** The storage namespace */
declare namespace StorageType {
  interface Session {
    /** The theme color */
    themeColor: string;
    /** The token */
    token: string;
    /** The refresh token */
    refreshToken: string;
    // /**
    //  * the theme settings
    //  */
    // themeSettings: App.Theme.ThemeSetting;
  }

  interface Local {
    /** The i18n language */
    lang: App.I18n.LangType;
    /** The token */
    token: string;
    /** Whether to keep login across browser sessions */
    rememberMe: boolean;
    /** Fixed sider with mix-menu */
    mixSiderFixed: CommonType.YesOrNo;
    /** The refresh token */
    refreshToken: string;
    /** The theme color */
    themeColor: string;
    /** The dark mode */
    darkMode: boolean;
    /** The theme settings */
    themeSettings: App.Theme.ThemeSetting;
    /**
     * The override theme flags
     *
     * The value is the build time of the project
     */
    overrideThemeFlag: string;
    /** The global tabs */
    globalTabs: App.Global.Tab[];
    /** The backup theme setting before is mobile */
    backupThemeSettingBeforeIsMobile: {
      layout: UnionKey.ThemeLayoutMode;
      siderCollapse: boolean;
    };
    /** The last login user id */
    lastLoginUserId: string;
    /** Current selected tenant id */
    currentTenantId: string;
    /** Runtime locale override cache */
    runtimeLocaleCache: Partial<
      Record<
        App.I18n.LangType,
        {
          version: string;
          messages: Record<string, string>;
        }
      >
    >;
  }
}
