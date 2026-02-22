declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    type MenuScope = 'platform' | 'tenant';

    interface TenantOption {
      tenantId: string;
      tenantName: string;
    }

    interface TimezoneOption {
      timezone: string;
      offset: string;
      label: string;
    }

    interface MenuItem {
      key: string;
      routeKey?: import('@elegant-router/types').RouteKey | null;
      routePath?: import('@elegant-router/types').RoutePath | null;
      label: string;
      i18nKey?: App.I18n.I18nKey | null;
      icon?: string | null;
      order: number;
      scope: 'platform' | 'tenant' | 'both';
      featureFlag?: string | null;
      children: MenuItem[];
    }

    interface RouteRule {
      enabled: boolean;
      permissions: string[];
      roles: string[];
      noTenantOnly: boolean;
      tenantOnly: boolean;
    }

    type RouteRuleMap = Partial<Record<import('@elegant-router/types').RouteKey, RouteRule>>;

    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      locale: App.I18n.LangType;
      preferredLocale?: App.I18n.LangType;
      timezone: string;
      themeSchema?: UnionKey.ThemeScheme | null;
      themeConfig?: Api.Theme.Config;
      themeProfileVersion?: number;
      roles: string[];
      buttons: string[];
      currentTenantId: string;
      currentTenantName: string;
      tenants: TenantOption[];
      menuScope: MenuScope;
      menus: MenuItem[];
      routeRules: RouteRuleMap;
    }

    interface UserProfile {
      userId: string;
      userName: string;
      locale: App.I18n.LangType;
      preferredLocale?: App.I18n.LangType;
      timezone: string;
      themeSchema?: UnionKey.ThemeScheme | null;
      email: string;
      roleCode: string;
      roleName: string;
      tenantId: string;
      tenantName: string;
      twoFactorEnabled?: boolean;
      status: Api.Common.EnableStatus;
      createTime: string;
      updateTime: string;
    }

    interface AuthSessionRecord {
      sessionId: string;
      current: boolean;
      legacy: boolean;
      rememberMe: boolean;
      hasAccessToken: boolean;
      hasRefreshToken: boolean;
      tokenCount: number;
      deviceAlias: string;
      deviceName: string;
      browser: string;
      os: string;
      deviceType: string;
      ipAddress: string;
      createdAt: string;
      lastUsedAt: string;
      lastAccessUsedAt: string;
      lastRefreshUsedAt: string;
      accessTokenExpiresAt: string;
      refreshTokenExpiresAt: string;
    }

    interface AuthSessionList {
      singleDeviceLogin: boolean;
      records: AuthSessionRecord[];
    }

    interface RevokeAuthSessionResult {
      sessionId: string;
      deletedTokenCount: number;
      revokedCurrentSession: boolean;
    }

    interface UpdateAuthSessionAliasPayload {
      deviceAlias?: string;
    }

    interface UpdateAuthSessionAliasResult {
      sessionId: string;
      deviceAlias: string;
      updatedTokenCount: number;
      updatedCurrentSession: boolean;
    }

    interface UpdateProfilePayload {
      userName: string;
      email: string;
      currentPassword?: string;
      password?: string;
      password_confirmation?: string;
    }

    interface UpdateLocalePayload {
      locale: App.I18n.LangType;
    }

    interface UpdatePreferencesPayload {
      themeSchema?: UnionKey.ThemeScheme;
      timezone?: string;
    }
  }
}
