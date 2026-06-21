/* eslint-disable class-methods-use-this, complexity, max-params */

import type { AxiosAdapter, AxiosResponseHeaders, InternalAxiosRequestConfig } from 'axios';
import {
  type AuditLogType,
  type DemoBackendRequest,
  type DemoBackendResponse,
  type DemoState,
  type DemoTenantRecord,
  type DemoUserRecord,
  cloneThemeConfig,
  createInitialState,
  defaultTimezoneOptions,
  demoAccessTokenPrefix,
  demoRefreshTokenPrefix,
  normalizeHeaders,
  normalizePath,
  nowString,
  ok,
  parseBody
} from './backend-core';

export type {
  AuditLogType,
  DemoAuditLogRecord,
  DemoBackendRequest,
  DemoBackendResponse,
  DemoFeatureFlagRecord,
  DemoLanguageRecord,
  DemoOrganizationRecord,
  DemoPermissionRecord,
  DemoRoleRecord,
  DemoSessionRecord,
  DemoState,
  DemoTeamRecord,
  DemoTenantRecord,
  DemoUserRecord
} from './backend-core';

export {
  addMinutes,
  cloneThemeConfig,
  createInitialState,
  defaultThemeConfig,
  defaultTimezoneOptions,
  fail,
  normalizeHeaders,
  normalizePath,
  nowString,
  ok,
  paginate,
  parseBody,
  successCode,
  toSnapshot,
  unauthorizedCode,
  validation
} from './backend-core';

export class DemoBackend {
  public state: DemoState = createInitialState();

  public readonly defaultTimezoneOptions = defaultTimezoneOptions;

  private tenantExtensionsLoaded = false;

  private systemDataLoaded = false;

  public async handle(request: DemoBackendRequest): Promise<DemoBackendResponse> {
    await new Promise<void>(resolve => {
      setTimeout(resolve, 40);
    });

    const response =
      (await this.handleSystem(request)) ??
      (await this.handleAuth(request)) ??
      (await this.handleTenant(request)) ??
      (await this.handleAccess(request));

    return response ?? ok({});
  }

  public async ensureTenantExtensionsData(): Promise<void> {
    if (this.tenantExtensionsLoaded || this.state.organizations.length > 0 || this.state.teams.length > 0) {
      this.tenantExtensionsLoaded = true;
      return;
    }

    const { createInitialTenantExtensions } = await import('./backend-tenant-seed');
    const { organizations, teams } = createInitialTenantExtensions();
    this.state.organizations = organizations;
    this.state.teams = teams;
    this.tenantExtensionsLoaded = true;
  }

  public async ensureSystemData(): Promise<void> {
    if (
      this.systemDataLoaded ||
      this.state.languages.length > 0 ||
      this.state.featureFlags.length > 0 ||
      this.state.auditPolicies.length > 0 ||
      this.state.auditPolicyHistory.length > 0
    ) {
      this.systemDataLoaded = true;
      return;
    }

    const { createInitialSystemState } = await import('./backend-system-seed');
    const systemState = createInitialSystemState();
    this.state.languages = systemState.languages;
    this.state.featureFlags = systemState.featureFlags;
    this.state.auditPolicies = systemState.auditPolicies;
    this.state.auditPolicyHistory = systemState.auditPolicyHistory;
    this.state.languageVersion = systemState.languageVersion;
    this.systemDataLoaded = true;
  }

  public parseId(path: string): number {
    const match = path.match(/\/(\d+)(?:\/|$)/);
    return Number(match?.[1] || 0);
  }

  public parseSessionId(path: string): string {
    const match = path.match(/\/auth\/sessions\/([^/]+)/);
    return decodeURIComponent(match?.[1] || '');
  }

  public requireCurrentUser(headers: Record<string, string>): DemoUserRecord {
    const authorization = headers.authorization || '';
    const token = String(authorization)
      .replace(/^Bearer\s+/i, '')
      .trim();
    const userId = this.userIdFromToken(token);
    return this.state.users.find(item => item.id === userId) || this.state.users[0];
  }

  public userIdFromToken(token: string): number {
    if (!token) return 1;
    const accessMatch = token.match(new RegExp(`^${demoAccessTokenPrefix}(\\d+)$`));
    if (accessMatch) return Number(accessMatch[1]);
    const refreshMatch = token.match(new RegExp(`^${demoRefreshTokenPrefix}(\\d+)$`));
    if (refreshMatch) return Number(refreshMatch[1]);
    return 1;
  }

  public tokenPair(userId: number) {
    return {
      token: `${demoAccessTokenPrefix}${userId}`,
      refreshToken: `${demoRefreshTokenPrefix}${userId}`
    };
  }

  public localeOptions(): Api.Language.LanguageOption[] {
    return [
      {
        id: 1,
        locale: 'en-US',
        localeName: 'English',
        isDefault: true,
        status: '1'
      },
      {
        id: 2,
        locale: 'zh-CN',
        localeName: '简体中文',
        isDefault: false,
        status: '1'
      }
    ];
  }

  public runtimeMessages(query: URLSearchParams): Api.Language.RuntimeMessagesPayload {
    const locale = (query.get('locale') || 'en-US') as App.I18n.LangType;
    const messages = this.state.languages
      .filter(item => item.locale === locale && item.status === '1')
      .reduce<Record<string, string>>((acc, item) => {
        acc[item.translationKey] = item.translationValue;
        return acc;
      }, {});

    return {
      locale,
      version: `demo-v${this.state.languageVersion}`,
      notModified: false,
      messages
    };
  }

  public themeScopePayload(): Api.Theme.ScopeConfigPayload {
    return {
      scopeType: 'platform',
      scopeId: 'platform',
      scopeName: 'Platform',
      version: 1,
      config: cloneThemeConfig(this.state.themeConfig),
      effectiveConfig: cloneThemeConfig(this.state.themeConfig),
      effectiveVersion: 1,
      editable: true
    };
  }

  public roleByCode(roleCode: string) {
    return this.state.roles.find(item => item.roleCode === roleCode) || this.state.roles[0];
  }

  public rolePermissions(roleCode: string): string[] {
    return [...this.roleByCode(roleCode).permissionCodes];
  }

  public resolveTenantScope(headers: Record<string, string>, user: DemoUserRecord): DemoTenantRecord | null {
    const requestedTenantId = Number(headers['x-tenant-id'] || 0);

    if (user.roleCode === 'R_SUPER') {
      if (!requestedTenantId) return null;
      return this.state.tenants.find(item => item.id === requestedTenantId) || null;
    }

    const tenantId = user.tenantId || requestedTenantId || 0;
    return this.state.tenants.find(item => item.id === tenantId) || null;
  }

  public tenantName(tenantId: number | null): string {
    if (!tenantId) return 'Platform';
    return this.state.tenants.find(item => item.id === tenantId)?.tenantName || 'Unknown Tenant';
  }

  public organizationName(organizationId: number | null): string {
    if (!organizationId) return '';
    return this.state.organizations.find(item => item.id === organizationId)?.organizationName || '';
  }

  public teamName(teamId: number | null): string {
    if (!teamId) return '';
    return this.state.teams.find(item => item.id === teamId)?.teamName || '';
  }

  public activeTenants(headers: Record<string, string>): Api.Tenant.TenantOption[] {
    const actor = this.requireCurrentUser(headers);

    if (actor.roleCode === 'R_SUPER') {
      return this.state.tenants
        .filter(item => item.status === '1')
        .map(item => ({
          id: item.id,
          tenantCode: item.tenantCode,
          tenantName: item.tenantName
        }));
    }

    return this.state.tenants
      .filter(item => item.id === actor.tenantId && item.status === '1')
      .map(item => ({
        id: item.id,
        tenantCode: item.tenantCode,
        tenantName: item.tenantName
      }));
  }

  public buildUserMenus(user: DemoUserRecord, scopedTenant: DemoTenantRecord | null): Api.Auth.MenuItem[] {
    const menuScope: Api.Auth.MenuScope = scopedTenant ? 'tenant' : 'platform';
    const permissionSet = new Set(this.rolePermissions(user.roleCode));
    const can = (permission: string) => permissionSet.has(permission);

    const createMenu = (options: {
      key: string;
      order: number;
      scope?: Api.Auth.MenuItem['scope'];
      routeKey?: import('@elegant-router/types').RouteKey;
      routePath?: import('@elegant-router/types').RoutePath;
      label?: string;
      i18nKey?: App.I18n.I18nKey;
      icon?: string;
      children?: Api.Auth.MenuItem[];
    }): Api.Auth.MenuItem => ({
      key: options.key,
      routeKey: options.routeKey ?? null,
      routePath: options.routePath ?? null,
      label: options.label ?? options.key,
      i18nKey: options.i18nKey ?? null,
      icon: options.icon ?? null,
      order: options.order,
      scope: options.scope ?? 'both',
      featureFlag: null,
      children: options.children ?? []
    });

    const accessChildren: Api.Auth.MenuItem[] = [];
    if (can('user.view')) {
      accessChildren.push(
        createMenu({
          key: 'user',
          routeKey: 'user',
          routePath: '/user',
          i18nKey: 'route.user',
          icon: 'mdi:account-outline',
          order: 1
        })
      );
    }
    if (can('role.view')) {
      accessChildren.push(
        createMenu({
          key: 'role',
          routeKey: 'role',
          routePath: '/role',
          i18nKey: 'route.role',
          icon: 'mdi:account-key-outline',
          order: 2
        })
      );
    }
    if (can('permission.view')) {
      accessChildren.push(
        createMenu({
          key: 'permission',
          routeKey: 'permission',
          routePath: '/permission',
          i18nKey: 'route.permission',
          icon: 'mdi:shield-key-outline',
          order: 3
        })
      );
    }
    if (can('organization.view')) {
      accessChildren.push(
        createMenu({
          key: 'organization',
          routeKey: 'organization',
          routePath: '/organization',
          i18nKey: 'route.organization',
          icon: 'mdi:domain',
          order: 4
        })
      );
    }
    if (can('team.view')) {
      accessChildren.push(
        createMenu({
          key: 'team',
          routeKey: 'team',
          routePath: '/team',
          i18nKey: 'route.team',
          icon: 'mdi:account-group-outline',
          order: 5
        })
      );
    }

    const systemChildren: Api.Auth.MenuItem[] = [];
    if (can('feature.flag.view')) {
      systemChildren.push(
        createMenu({
          key: 'feature-flag',
          routeKey: 'feature-flag',
          routePath: '/feature-flag',
          i18nKey: 'route.feature-flag',
          icon: 'mdi:toggle-switch-outline',
          order: 1
        })
      );
    }
    if (can('theme.config.view')) {
      systemChildren.push(
        createMenu({
          key: 'theme-config',
          routeKey: 'theme-config',
          routePath: '/theme-config',
          i18nKey: 'route.theme-config',
          icon: 'mdi:palette-outline',
          order: 2
        })
      );
    }
    if (can('language.view')) {
      systemChildren.push(
        createMenu({
          key: 'language',
          routeKey: 'language',
          routePath: '/language',
          i18nKey: 'route.language',
          icon: 'mdi:translate',
          order: 3
        })
      );
    }
    if (can('audit.policy.view')) {
      systemChildren.push(
        createMenu({
          key: 'audit-policy',
          routeKey: 'audit-policy',
          routePath: '/audit-policy',
          i18nKey: 'route.audit-policy',
          icon: 'mdi:file-document-edit-outline',
          order: 4
        })
      );
    }
    if (can('audit.view')) {
      systemChildren.push(
        createMenu({
          key: 'audit',
          routeKey: 'audit',
          routePath: '/audit',
          i18nKey: 'route.audit',
          icon: 'mdi:file-search-outline',
          order: 5
        })
      );
    }

    const menus: Api.Auth.MenuItem[] = [
      createMenu({
        key: 'dashboard',
        routeKey: 'dashboard',
        routePath: '/dashboard',
        i18nKey: 'route.dashboard',
        icon: 'mdi:view-dashboard-outline',
        order: 1
      })
    ];

    if (menuScope === 'platform' && can('tenant.view')) {
      menus.push(
        createMenu({
          key: 'tenant',
          routeKey: 'tenant',
          routePath: '/tenant',
          i18nKey: 'route.tenant',
          icon: 'mdi:office-building-outline',
          order: 2,
          scope: 'platform'
        })
      );
    }

    if (accessChildren.length > 0) {
      menus.push(
        createMenu({
          key: 'access-management',
          i18nKey: 'menu.accessManagement',
          label: 'Access Management',
          icon: 'mdi:shield-account-outline',
          order: 3,
          children: accessChildren
        })
      );
    }

    if (systemChildren.length > 0) {
      menus.push(
        createMenu({
          key: 'platform-settings',
          i18nKey: 'menu.systemSettings',
          label: 'System Settings',
          icon: 'mdi:cog-outline',
          order: 4,
          children: systemChildren
        })
      );
    }

    return menus;
  }

  public buildRouteRules(user: DemoUserRecord): Api.Auth.RouteRuleMap {
    const permissionSet = new Set(this.rolePermissions(user.roleCode));
    const can = (permission: string) => permissionSet.has(permission);
    const createRule = (enabled: boolean, permissions: string[]): Api.Auth.RouteRule => ({
      enabled,
      permissions,
      roles: [],
      noTenantOnly: false,
      tenantOnly: false
    });

    return {
      dashboard: createRule(true, []),
      tenant: createRule(can('tenant.view'), ['tenant.view']),
      organization: createRule(can('organization.view'), ['organization.view']),
      team: createRule(can('team.view'), ['team.view']),
      user: createRule(can('user.view'), ['user.view']),
      role: createRule(can('role.view'), ['role.view']),
      permission: createRule(can('permission.view'), ['permission.view']),
      language: createRule(can('language.view'), ['language.view']),
      'theme-config': createRule(can('theme.config.view'), ['theme.config.view']),
      'feature-flag': createRule(can('feature.flag.view'), ['feature.flag.view']),
      'audit-policy': createRule(can('audit.policy.view'), ['audit.policy.view']),
      audit: createRule(can('audit.view'), ['audit.view'])
    };
  }

  public userInfo(headers: Record<string, string>): Api.Auth.UserInfo {
    const user = this.requireCurrentUser(headers);
    const scopedTenant = this.resolveTenantScope(headers, user);
    const menus = this.buildUserMenus(user, scopedTenant);
    const routeRules = this.buildRouteRules(user);

    return {
      userId: String(user.id),
      userName: user.userName,
      locale: user.locale,
      preferredLocale: user.locale,
      timezone: user.timezone,
      themeSchema: user.themeSchema,
      themeConfig: cloneThemeConfig(this.state.themeConfig),
      themeProfileVersion: 1,
      roles: [user.roleCode],
      buttons: this.rolePermissions(user.roleCode),
      currentTenantId: scopedTenant ? String(scopedTenant.id) : '',
      currentTenantName: scopedTenant?.tenantName || 'Platform',
      tenants: this.state.tenants.map(item => ({ tenantId: String(item.id), tenantName: item.tenantName })),
      menuScope: scopedTenant ? 'tenant' : 'platform',
      menus,
      routeRules
    };
  }

  public userMenus(headers: Record<string, string>) {
    const info = this.userInfo(headers);
    return {
      menuScope: info.menuScope,
      menus: info.menus,
      routeRules: info.routeRules
    };
  }

  public userProfile(headers: Record<string, string>): Api.Auth.UserProfile {
    const user = this.requireCurrentUser(headers);
    const role = this.roleByCode(user.roleCode);
    return {
      userId: String(user.id),
      userName: user.userName,
      locale: user.locale,
      preferredLocale: user.locale,
      timezone: user.timezone,
      themeSchema: user.themeSchema,
      email: user.email,
      roleCode: user.roleCode,
      roleName: role.roleName,
      tenantId: user.tenantId ? String(user.tenantId) : '',
      tenantName: this.tenantName(user.tenantId),
      twoFactorEnabled: user.twoFactorEnabled,
      status: user.status,
      createTime: user.createTime,
      updateTime: user.updateTime
    };
  }

  public appendAuditLog(params: {
    action: string;
    logType: AuditLogType;
    user: DemoUserRecord;
    tenantId: number | null;
    target: string;
    auditableType: string;
    auditableId: string;
    oldValues: Record<string, unknown>;
    newValues: Record<string, unknown>;
  }) {
    this.state.auditLogCounter += 1;
    this.state.auditLogs.unshift({
      id: this.state.auditLogCounter,
      action: params.action,
      logType: params.logType,
      userName: params.user.userName,
      tenantId: params.tenantId ? String(params.tenantId) : '',
      tenantName: this.tenantName(params.tenantId),
      auditableType: params.auditableType,
      auditableId: params.auditableId,
      target: params.target,
      oldValues: params.oldValues,
      newValues: params.newValues,
      ipAddress: '127.0.0.1',
      userAgent: 'Demo Runtime',
      requestId: `demo-req-${this.state.auditLogCounter}`,
      createTime: nowString()
    });
  }

  public appendAuditLogFromHeaders(
    headers: Record<string, string>,
    action: string,
    tenantId: number | null,
    auditableType: string,
    auditableId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
  ) {
    this.appendAuditLog({
      action,
      logType: 'operation',
      user: this.requireCurrentUser(headers),
      tenantId,
      target: auditableId,
      auditableType,
      auditableId,
      oldValues,
      newValues
    });
  }

  private async handleAuth(request: DemoBackendRequest): Promise<DemoBackendResponse | null> {
    if (!request.path.startsWith('/auth/')) {
      return null;
    }

    const { handleAuthRequest } = await import('./backend-auth');
    return handleAuthRequest(this, request);
  }

  private async handleTenant(request: DemoBackendRequest): Promise<DemoBackendResponse | null> {
    if (!this.matchesTenantPath(request.path)) {
      return null;
    }

    await this.ensureTenantExtensionsData();
    const { handleTenantRequest } = await import('./backend-tenant');
    return handleTenantRequest(this, request);
  }

  private async handleAccess(request: DemoBackendRequest): Promise<DemoBackendResponse | null> {
    if (!this.matchesAccessPath(request.path)) {
      return null;
    }

    if (request.path.startsWith('/user')) {
      await this.ensureTenantExtensionsData();
    }

    const { handleAccessRequest } = await import('./backend-access');
    return handleAccessRequest(this, request);
  }

  private async handleSystem(request: DemoBackendRequest): Promise<DemoBackendResponse | null> {
    if (!this.matchesSystemPath(request.path)) {
      return null;
    }

    if (this.requiresSystemSeed(request.path)) {
      await this.ensureSystemData();
    }

    const { handleSystemRequest } = await import('./backend-system');
    return handleSystemRequest(this, request);
  }

  private matchesTenantPath(path: string): boolean {
    return path.startsWith('/tenant') || path.startsWith('/organization') || path.startsWith('/team');
  }

  private matchesAccessPath(path: string): boolean {
    return path.startsWith('/role') || path.startsWith('/permission') || path.startsWith('/user');
  }

  private matchesSystemPath(path: string): boolean {
    return (
      path.startsWith('/system/') ||
      path.startsWith('/language') ||
      path.startsWith('/theme/') ||
      path.startsWith('/audit/') ||
      path.startsWith('/health')
    );
  }

  private requiresSystemSeed(path: string): boolean {
    return (
      path.startsWith('/language') ||
      path.startsWith('/audit') ||
      path === '/theme/config' ||
      path === '/theme/public-config' ||
      path.startsWith('/system/feature-flags')
    );
  }
}

let demoBackend: DemoBackend | null = null;

export function getDemoBackend() {
  if (!demoBackend) {
    demoBackend = new DemoBackend();
  }

  return demoBackend;
}

export function resetDemoBackend() {
  demoBackend = new DemoBackend();
  return demoBackend;
}

export function normalizeDemoFetchPath(path: string): string {
  const normalized = normalizePath(path);
  if (/^\/role\/\d+\/permissions$/.test(normalized)) return '/role/:id/permissions';
  if (/^\/role\/\d+$/.test(normalized)) return '/role/:id';
  if (/^\/permission\/\d+$/.test(normalized)) return '/permission/:id';
  if (/^\/tenant\/\d+$/.test(normalized)) return '/tenant/:id';
  if (/^\/organization\/\d+$/.test(normalized)) return '/organization/:id';
  if (/^\/team\/\d+$/.test(normalized)) return '/team/:id';
  if (/^\/language\/\d+$/.test(normalized)) return '/language/:id';
  if (/^\/user\/\d+\/role$/.test(normalized)) return '/user/:id/role';
  if (/^\/user\/\d+$/.test(normalized)) return '/user/:id';
  if (/^\/auth\/sessions\/[^/]+\/alias$/.test(normalized)) return '/auth/sessions/:sessionId/alias';
  if (/^\/auth\/sessions\/[^/]+$/.test(normalized)) return '/auth/sessions/:sessionId';
  return normalized;
}

export function createDemoAxiosAdapter(): AxiosAdapter {
  const backend = getDemoBackend();

  return async (config: InternalAxiosRequestConfig) => {
    const requestUrl = new URL(String(config.url), window.location.origin);
    const path = normalizeDemoFetchPath(requestUrl.pathname);
    const response = await backend.handle({
      method: String(config.method || 'GET'),
      path,
      query: requestUrl.searchParams,
      headers: normalizeHeaders(config.headers),
      body: parseBody(config.data)
    });

    return {
      data: response.body,
      status: response.status,
      statusText: response.status >= 400 ? 'Error' : 'OK',
      headers: (response.headers || {}) as AxiosResponseHeaders,
      config
    };
  };
}

export function matchesDemoApiUrl(input: string | URL): boolean {
  const url = input instanceof URL ? input : new URL(String(input), window.location.origin);
  const path = normalizePath(url.pathname);

  return (
    path.startsWith('/auth/') ||
    path.startsWith('/tenant') ||
    path.startsWith('/organization') ||
    path.startsWith('/team') ||
    path.startsWith('/role') ||
    path.startsWith('/permission') ||
    path.startsWith('/user') ||
    path.startsWith('/audit') ||
    path.startsWith('/theme') ||
    path.startsWith('/language') ||
    path.startsWith('/health') ||
    path.startsWith('/system/')
  );
}
