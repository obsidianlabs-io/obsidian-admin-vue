/* eslint-disable class-methods-use-this, complexity, max-params */

import type { AxiosAdapter, AxiosResponseHeaders, InternalAxiosRequestConfig } from 'axios';

export interface DemoBackendRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface DemoBackendResponse<T = unknown> {
  status: number;
  headers?: Record<string, string>;
  body: App.Service.Response<T>;
}

type EnableStatus = '1' | '2';
type AuditLogType = 'login' | 'api' | 'operation' | 'data' | 'permission';

interface DemoTenantRecord {
  id: number;
  tenantCode: string;
  tenantName: string;
  status: EnableStatus;
  createTime: string;
  updateTime: string;
}

interface DemoOrganizationRecord {
  id: number;
  tenantId: number;
  organizationCode: string;
  organizationName: string;
  description: string;
  status: EnableStatus;
  sort: number;
  createTime: string;
  updateTime: string;
}

interface DemoTeamRecord {
  id: number;
  tenantId: number;
  organizationId: number;
  teamCode: string;
  teamName: string;
  description: string;
  status: EnableStatus;
  sort: number;
  createTime: string;
  updateTime: string;
}

interface DemoPermissionRecord {
  id: number;
  permissionCode: string;
  permissionName: string;
  group: string;
  description: string;
  status: EnableStatus;
  createTime: string;
  updateTime: string;
}

interface DemoRoleRecord {
  id: number;
  roleCode: string;
  roleName: string;
  tenantId: number | null;
  description: string;
  status: EnableStatus;
  level: number;
  permissionCodes: string[];
  createTime: string;
  updateTime: string;
}

interface DemoUserRecord {
  id: number;
  tenantId: number | null;
  organizationId: number | null;
  teamId: number | null;
  userName: string;
  email: string;
  password: string;
  roleCode: string;
  status: EnableStatus;
  locale: App.I18n.LangType;
  timezone: string;
  themeSchema: UnionKey.ThemeScheme | null;
  twoFactorEnabled: boolean;
  createTime: string;
  updateTime: string;
}

interface DemoLanguageRecord {
  id: number;
  locale: App.I18n.LangType;
  localeName: string;
  translationKey: string;
  translationValue: string;
  description: string;
  status: EnableStatus;
  createTime: string;
  updateTime: string;
}

interface DemoFeatureFlagRecord {
  key: string;
  enabled: boolean;
  percentage: number;
  platformOnly: boolean;
  tenantOnly: boolean;
  roleCodes: string[];
  globalOverride: boolean | null;
}

interface DemoAuditPolicyRecord {
  action: string;
  category: 'mandatory' | 'optional';
  mandatory: boolean;
  locked: boolean;
  lockReason: string;
  description: string;
  enabled: boolean;
  samplingRate: number;
  retentionDays: number;
  source: 'default' | 'platform' | 'tenant';
  defaultEnabled: boolean;
  defaultSamplingRate: number;
  defaultRetentionDays: number;
}

interface DemoAuditPolicyHistoryRecord {
  id: string;
  scope: string;
  changedByUserId: string;
  changedByUserName: string;
  changeReason: string;
  changedCount: number;
  changedActions: string[];
  createdAt: string;
}

interface DemoAuditLogRecord {
  id: number;
  action: string;
  logType: AuditLogType;
  userName: string;
  tenantId: string;
  tenantName: string;
  auditableType: string;
  auditableId: string;
  target: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  createTime: string;
}

interface DemoSessionRecord {
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

interface DemoState {
  tenants: DemoTenantRecord[];
  organizations: DemoOrganizationRecord[];
  teams: DemoTeamRecord[];
  permissions: DemoPermissionRecord[];
  roles: DemoRoleRecord[];
  users: DemoUserRecord[];
  languages: DemoLanguageRecord[];
  featureFlags: DemoFeatureFlagRecord[];
  auditPolicies: DemoAuditPolicyRecord[];
  auditPolicyHistory: DemoAuditPolicyHistoryRecord[];
  auditLogs: DemoAuditLogRecord[];
  sessions: Record<number, DemoSessionRecord[]>;
  themeConfig: Api.Theme.Config;
  revisionCounter: number;
  auditLogCounter: number;
  languageVersion: number;
}

const successCode = '0000';
const validationCode = '1002';
const unauthorizedCode = '8888';
const invalidCredentialsCode = '4010';
const invalidTwoFactorCode = '4021';
const demoAccessTokenPrefix = 'demo-access-user-';
const demoRefreshTokenPrefix = 'demo-refresh-user-';
const allPermissionCodes = [
  'user.view',
  'user.manage',
  'role.view',
  'role.manage',
  'permission.view',
  'permission.manage',
  'tenant.view',
  'tenant.manage',
  'organization.view',
  'organization.manage',
  'team.view',
  'team.manage',
  'language.view',
  'language.manage',
  'audit.view',
  'audit.policy.view',
  'audit.policy.manage',
  'feature.flag.view',
  'feature.flag.manage',
  'theme.config.view',
  'theme.config.manage'
] as const;
const adminPermissionCodes = [
  'user.view',
  'user.manage',
  'role.view',
  'role.manage',
  'permission.view',
  'organization.view',
  'organization.manage',
  'team.view',
  'team.manage',
  'audit.view'
] as const;
const defaultTimezoneOptions: Api.Auth.TimezoneOption[] = [
  { timezone: 'UTC', offset: '+00:00', label: 'UTC (+00:00)' },
  {
    timezone: 'Asia/Kuala_Lumpur',
    offset: '+08:00',
    label: 'Asia/Kuala_Lumpur (+08:00)'
  },
  {
    timezone: 'Asia/Singapore',
    offset: '+08:00',
    label: 'Asia/Singapore (+08:00)'
  }
];
const defaultThemeConfig: Api.Theme.Config = {
  themeScheme: 'light',
  themeColor: '#5b8cff',
  themeRadius: 6,
  headerHeight: 56,
  siderWidth: 220,
  siderCollapsedWidth: 64,
  layoutMode: 'vertical',
  scrollMode: 'content',
  darkSider: false,
  themeSchemaVisible: true,
  headerFullscreenVisible: true,
  tabVisible: true,
  tabFullscreenVisible: true,
  breadcrumbVisible: true,
  footerVisible: true,
  footerHeight: 48,
  multilingualVisible: true,
  globalSearchVisible: true,
  themeConfigVisible: true,
  pageAnimate: true,
  pageAnimateMode: 'fade-slide',
  fixedHeaderAndTab: true
};

function nowString(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function addMinutes(time: string, minutes: number): string {
  const date = new Date(`${time.replace(' ', 'T')}Z`);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function normalizePath(pathname: string): string {
  return pathname.replace(/^\/proxy-default/, '').replace(/^\/api\/v\d+/, '');
}

function normalizeHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  const result: Record<string, string> = {};
  Object.entries(headers as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key.toLowerCase()] = value;
      return;
    }

    if (Array.isArray(value)) {
      result[key.toLowerCase()] = value.join(',');
      return;
    }

    if (value !== null && value !== undefined) {
      result[key.toLowerCase()] = String(value);
    }
  });

  return result;
}

function parseBody(data: unknown): Record<string, unknown> {
  if (!data) {
    return {};
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const parsed: Record<string, unknown> = {};
    data.forEach((value, key) => {
      parsed[key] = value;
    });
    return parsed;
  }

  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
}

function ok<T>(data: T, msg = 'ok'): DemoBackendResponse<T> {
  return {
    status: 200,
    body: {
      code: successCode,
      msg,
      data
    }
  };
}

function validation(errors: Record<string, string[]>): DemoBackendResponse<{ errors: Record<string, string[]> }> {
  return {
    status: 422,
    body: {
      code: validationCode,
      msg: 'Validation failed',
      data: { errors }
    }
  };
}

function fail(code: string, msg: string, status = 400): DemoBackendResponse<Record<string, never>> {
  return {
    status,
    body: {
      code,
      msg,
      data: {}
    }
  };
}

function paginate<T>(items: T[], query: URLSearchParams) {
  const current = Math.max(Number(query.get('current') || 1), 1);
  const size = Math.max(Number(query.get('size') || 10), 1);
  const start = (current - 1) * size;

  return {
    current,
    size,
    total: items.length,
    records: items.slice(start, start + size)
  };
}

function toSnapshot(value: object): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function createInitialState(): DemoState {
  const createdAt = nowString();
  const tenants: DemoTenantRecord[] = [
    {
      id: 1,
      tenantCode: 'TENANT_MAIN',
      tenantName: 'Main Tenant',
      status: '1',
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 2,
      tenantCode: 'TENANT_BRANCH',
      tenantName: 'Branch Tenant',
      status: '1',
      createTime: createdAt,
      updateTime: createdAt
    }
  ];
  const organizations: DemoOrganizationRecord[] = [
    {
      id: 1,
      tenantId: 1,
      organizationCode: 'ORG_MAIN_HQ',
      organizationName: 'Main HQ',
      description: 'Primary operating organization',
      status: '1',
      sort: 10,
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 2,
      tenantId: 2,
      organizationCode: 'ORG_BRANCH_OPS',
      organizationName: 'Branch Operations',
      description: 'Branch operating organization',
      status: '1',
      sort: 10,
      createTime: createdAt,
      updateTime: createdAt
    }
  ];
  const teams: DemoTeamRecord[] = [
    {
      id: 1,
      tenantId: 1,
      organizationId: 1,
      teamCode: 'TEAM_MAIN_PLATFORM',
      teamName: 'Main Platform Team',
      description: 'Platform delivery team',
      status: '1',
      sort: 10,
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 2,
      tenantId: 2,
      organizationId: 2,
      teamCode: 'TEAM_BRANCH_SUPPORT',
      teamName: 'Branch Support Team',
      description: 'Support operations team',
      status: '1',
      sort: 10,
      createTime: createdAt,
      updateTime: createdAt
    }
  ];
  const permissions: DemoPermissionRecord[] = allPermissionCodes.map((permissionCode, index) => ({
    id: index + 1,
    permissionCode,
    permissionName: permissionCode.replace(/\./g, ' '),
    group: permissionCode.split('.')[0],
    description: `${permissionCode} permission`,
    status: '1',
    createTime: createdAt,
    updateTime: createdAt
  }));
  const roles: DemoRoleRecord[] = [
    {
      id: 1,
      roleCode: 'R_SUPER',
      roleName: 'Super Admin',
      tenantId: null,
      description: 'Global super administrator',
      status: '1',
      level: 999,
      permissionCodes: [...allPermissionCodes],
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 2,
      roleCode: 'R_ADMIN',
      roleName: 'Admin',
      tenantId: 1,
      description: 'Main tenant administrator',
      status: '1',
      level: 700,
      permissionCodes: [...adminPermissionCodes],
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 3,
      roleCode: 'R_BRANCH_ADMIN',
      roleName: 'Branch Admin',
      tenantId: 2,
      description: 'Branch tenant administrator',
      status: '1',
      level: 650,
      permissionCodes: [...adminPermissionCodes],
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 4,
      roleCode: 'R_USER',
      roleName: 'User',
      tenantId: 1,
      description: 'Regular tenant user',
      status: '1',
      level: 100,
      permissionCodes: ['user.view'],
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 5,
      roleCode: 'R_BRANCH_USER',
      roleName: 'Branch User',
      tenantId: 2,
      description: 'Regular branch user',
      status: '1',
      level: 100,
      permissionCodes: ['user.view'],
      createTime: createdAt,
      updateTime: createdAt
    }
  ];
  const users: DemoUserRecord[] = [
    {
      id: 1,
      tenantId: null,
      organizationId: null,
      teamId: null,
      userName: 'Super',
      email: 'super@obsidian.demo',
      password: '123456',
      roleCode: 'R_SUPER',
      status: '1',
      locale: 'en-US',
      timezone: 'UTC',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 2,
      tenantId: 1,
      organizationId: 1,
      teamId: 1,
      userName: 'Admin',
      email: 'admin-main@obsidian.demo',
      password: '123456',
      roleCode: 'R_ADMIN',
      status: '1',
      locale: 'en-US',
      timezone: 'Asia/Kuala_Lumpur',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 3,
      tenantId: 2,
      organizationId: 2,
      teamId: 2,
      userName: 'AdminBranch',
      email: 'admin-branch@obsidian.demo',
      password: '123456',
      roleCode: 'R_BRANCH_ADMIN',
      status: '1',
      locale: 'en-US',
      timezone: 'Asia/Singapore',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 4,
      tenantId: 1,
      organizationId: 1,
      teamId: 1,
      userName: 'User',
      email: 'user-main@obsidian.demo',
      password: '123456',
      roleCode: 'R_USER',
      status: '1',
      locale: 'en-US',
      timezone: 'UTC',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 5,
      tenantId: 2,
      organizationId: 2,
      teamId: 2,
      userName: 'UserBranch',
      email: 'user-branch@obsidian.demo',
      password: '123456',
      roleCode: 'R_BRANCH_USER',
      status: '1',
      locale: 'en-US',
      timezone: 'UTC',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: createdAt,
      updateTime: createdAt
    }
  ];
  const languages: DemoLanguageRecord[] = [
    {
      id: 1,
      locale: 'en-US',
      localeName: 'English',
      translationKey: 'login.button',
      translationValue: 'Login',
      description: 'Login submit button',
      status: '1',
      createTime: createdAt,
      updateTime: createdAt
    },
    {
      id: 2,
      locale: 'zh-CN',
      localeName: '简体中文',
      translationKey: 'login.button',
      translationValue: '登录',
      description: '登录按钮',
      status: '1',
      createTime: createdAt,
      updateTime: createdAt
    }
  ];
  const featureFlags: DemoFeatureFlagRecord[] = [
    {
      key: 'menu.role',
      enabled: true,
      percentage: 100,
      platformOnly: false,
      tenantOnly: false,
      roleCodes: ['R_SUPER', 'R_ADMIN'],
      globalOverride: null
    },
    {
      key: 'audit.realtime',
      enabled: true,
      percentage: 100,
      platformOnly: true,
      tenantOnly: false,
      roleCodes: ['R_SUPER'],
      globalOverride: true
    }
  ];
  const auditPolicies: DemoAuditPolicyRecord[] = [
    {
      action: 'audit.policy.update',
      category: 'mandatory',
      mandatory: true,
      locked: true,
      lockReason: 'compliance',
      description: 'Update audit policy',
      enabled: true,
      samplingRate: 1,
      retentionDays: 365,
      source: 'platform',
      defaultEnabled: true,
      defaultSamplingRate: 1,
      defaultRetentionDays: 365
    },
    {
      action: 'user.locale.update',
      category: 'optional',
      mandatory: false,
      locked: false,
      lockReason: '',
      description: 'Update user locale',
      enabled: true,
      samplingRate: 1,
      retentionDays: 180,
      source: 'platform',
      defaultEnabled: true,
      defaultSamplingRate: 1,
      defaultRetentionDays: 180
    }
  ];
  const auditPolicyHistory: DemoAuditPolicyHistoryRecord[] = [
    {
      id: 'revision-1',
      scope: 'platform',
      changedByUserId: '1',
      changedByUserName: 'Super',
      changeReason: 'Initial demo seed',
      changedCount: 1,
      changedActions: ['audit.policy.update'],
      createdAt
    }
  ];
  const auditLogs: DemoAuditLogRecord[] = [
    {
      id: 1,
      action: 'auth.login',
      logType: 'login',
      userName: 'Super',
      tenantId: '',
      tenantName: 'Platform',
      auditableType: 'user',
      auditableId: '1',
      target: 'Super',
      oldValues: {},
      newValues: {},
      ipAddress: '127.0.0.1',
      userAgent: 'Demo Runtime',
      requestId: 'demo-login-1',
      createTime: createdAt
    }
  ];
  const sessions: Record<number, DemoSessionRecord[]> = Object.fromEntries(
    users.map(user => {
      const sessionId = `demo-session-${user.id}`;
      return [
        user.id,
        [
          {
            sessionId,
            current: true,
            legacy: false,
            rememberMe: true,
            hasAccessToken: true,
            hasRefreshToken: true,
            tokenCount: 2,
            deviceAlias: 'Demo Browser',
            deviceName: 'Browser Preview',
            browser: 'Chromium',
            os: 'Web',
            deviceType: 'desktop',
            ipAddress: '127.0.0.1',
            createdAt,
            lastUsedAt: createdAt,
            lastAccessUsedAt: createdAt,
            lastRefreshUsedAt: createdAt,
            accessTokenExpiresAt: addMinutes(createdAt, 60),
            refreshTokenExpiresAt: addMinutes(createdAt, 60 * 24 * 7)
          }
        ]
      ];
    })
  );

  return {
    tenants,
    organizations,
    teams,
    permissions,
    roles,
    users,
    languages,
    featureFlags,
    auditPolicies,
    auditPolicyHistory,
    auditLogs,
    sessions,
    themeConfig: { ...defaultThemeConfig },
    revisionCounter: 1,
    auditLogCounter: auditLogs.length,
    languageVersion: 1
  };
}

function cloneThemeConfig(config: Api.Theme.Config): Api.Theme.Config {
  return JSON.parse(JSON.stringify(config)) as Api.Theme.Config;
}

export class DemoBackend {
  private state: DemoState = createInitialState();

  public async handle(request: DemoBackendRequest): Promise<DemoBackendResponse> {
    await new Promise<void>(resolve => {
      setTimeout(resolve, 40);
    });

    switch (`${request.method.toUpperCase()} ${request.path}`) {
      case 'GET /system/bootstrap':
        return ok({ defaultLocale: 'en-US' });
      case 'GET /health/live':
      case 'GET /health':
      case 'GET /health/ready':
        return ok({ status: 'alive' });
      case 'GET /theme/public-config':
      case 'GET /theme/config':
        return ok(this.themeScopePayload());
      case 'PUT /theme/config':
        return this.updateThemeConfig(request.body);
      case 'POST /theme/config/reset':
        this.state.themeConfig = cloneThemeConfig(defaultThemeConfig);
        return ok(this.themeScopePayload(), 'Theme configuration reset');
      case 'GET /language/locales':
      case 'GET /language/options':
        return ok({ records: this.localeOptions() });
      case 'GET /language/messages':
        return ok(this.runtimeMessages(request.query));
      case 'GET /language/list':
        return ok(this.languageList(request.query));
      case 'POST /language':
        return this.createLanguage(request.body);
      case 'PUT /language/:id':
        return this.updateLanguage(request.path, request.body);
      case 'DELETE /language/:id':
        return this.deleteLanguage(request.path);
      case 'POST /auth/login':
        return this.login(request.body);
      case 'POST /auth/register':
        return this.register(request.body);
      case 'POST /auth/logout':
        return ok({ userId: this.requireCurrentUser(request.headers).id.toString() }, 'Logout success');
      case 'POST /auth/refreshToken':
        return this.refreshToken(request.body);
      case 'POST /auth/forgot-password':
        return ok({ resetToken: 'demo-reset-token' }, 'If the email exists, a reset link has been sent');
      case 'POST /auth/reset-password':
        return this.resetPassword(request.body);
      case 'GET /auth/getUserInfo':
      case 'GET /auth/me':
        return ok(this.userInfo(request.headers));
      case 'GET /auth/menus':
        return ok(this.userMenus(request.headers));
      case 'GET /auth/profile':
        return ok(this.userProfile(request.headers));
      case 'PUT /auth/profile':
        return this.updateProfile(request.headers, request.body);
      case 'PUT /auth/preferences':
        return this.updatePreferences(request.headers, request.body);
      case 'PUT /auth/preferred-locale':
        return this.updatePreferredLocale(request.headers, request.body);
      case 'GET /auth/timezones':
        return ok({ defaultTimezone: 'UTC', records: defaultTimezoneOptions });
      case 'GET /auth/sessions':
        return ok(this.userSessions(request.headers));
      case 'DELETE /auth/sessions/:sessionId':
        return this.revokeSession(request.path, request.headers);
      case 'PUT /auth/sessions/:sessionId/alias':
        return this.updateSessionAlias(request.path, request.headers, request.body);
      case 'POST /auth/2fa/setup':
        return ok({
          secret: 'DEMOSECRET123',
          otpauthUrl: 'otpauth://totp/Obsidian:demo?secret=DEMOSECRET123',
          enabled: this.requireCurrentUser(request.headers).twoFactorEnabled
        });
      case 'POST /auth/2fa/enable':
        return this.toggleTwoFactor(request.headers, request.body, true);
      case 'POST /auth/2fa/disable':
        return this.toggleTwoFactor(request.headers, request.body, false);
      case 'GET /tenant/list':
        return ok(this.tenantList(request.query, request.headers));
      case 'GET /tenant/all':
        return ok({ records: this.activeTenants(request.headers) });
      case 'POST /tenant':
        return this.createTenant(request.body, request.headers);
      case 'PUT /tenant/:id':
        return this.updateTenant(request.path, request.body, request.headers);
      case 'DELETE /tenant/:id':
        return this.deleteTenant(request.path);
      case 'GET /organization/list':
        return ok(this.organizationList(request.query, request.headers));
      case 'GET /organization/all':
        return ok({ records: this.organizationOptions(request.headers) });
      case 'POST /organization':
        return this.createOrganization(request.body, request.headers);
      case 'PUT /organization/:id':
        return this.updateOrganization(request.path, request.body, request.headers);
      case 'DELETE /organization/:id':
        return this.deleteOrganization(request.path);
      case 'GET /team/list':
        return ok(this.teamList(request.query, request.headers));
      case 'GET /team/all':
        return ok({
          records: this.teamOptions(request.query, request.headers)
        });
      case 'POST /team':
        return this.createTeam(request.body, request.headers);
      case 'PUT /team/:id':
        return this.updateTeam(request.path, request.body, request.headers);
      case 'DELETE /team/:id':
        return this.deleteTeam(request.path);
      case 'GET /permission/list':
        return ok(this.permissionList(request.query));
      case 'GET /permission/all':
        return ok({ records: this.permissionOptions() });
      case 'POST /permission':
        return this.createPermission(request.body);
      case 'PUT /permission/:id':
        return this.updatePermission(request.path, request.body);
      case 'DELETE /permission/:id':
        return this.deletePermission(request.path);
      case 'GET /role/list':
        return ok(this.roleList(request.query, request.headers));
      case 'GET /role/all':
        return ok({
          records: this.roleOptions(request.query, request.headers)
        });
      case 'GET /role/assignable-permissions':
        return ok({ records: this.permissionOptions() });
      case 'POST /role':
        return this.createRole(request.body, request.headers);
      case 'PUT /role/:id':
        return this.updateRole(request.path, request.body, request.headers);
      case 'PUT /role/:id/permissions':
        return this.syncRolePermissions(request.path, request.body);
      case 'DELETE /role/:id':
        return this.deleteRole(request.path);
      case 'GET /user/list':
        return ok(this.userList(request.query, request.headers));
      case 'POST /user':
        return this.createUser(request.body, request.headers);
      case 'PUT /user/:id':
        return this.updateUser(request.path, request.body, request.headers);
      case 'PUT /user/:id/role':
        return this.assignUserRole(request.path, request.body);
      case 'DELETE /user/:id':
        return this.deleteUser(request.path);
      case 'GET /audit/list':
        return ok(this.auditLogList(request.query, request.headers));
      case 'GET /audit/policy/list':
        return ok({ records: this.state.auditPolicies });
      case 'GET /audit/policy/history':
        return ok(paginate(this.state.auditPolicyHistory, request.query));
      case 'PUT /audit/policy':
        return this.updateAuditPolicy(request.body, request.headers);
      case 'GET /system/feature-flags':
        return ok(paginate(this.featureFlagList(request.query), request.query));
      case 'PUT /system/feature-flags/toggle':
        return this.toggleFeatureFlag(request.body, request.headers);
      case 'DELETE /system/feature-flags/purge':
        return this.purgeFeatureFlag(request.body, request.headers);
      default:
        if (request.path.startsWith('/system/ui/crud-schema/')) {
          return ok(this.crudSchema(request.path));
        }

        if (request.path.startsWith('/auth/error')) {
          return ok({ errors: [] });
        }

        return ok({});
    }
  }

  private parseId(path: string): number {
    const match = path.match(/\/(\d+)(?:\/|$)/);
    return Number(match?.[1] || 0);
  }

  private parseSessionId(path: string): string {
    const match = path.match(/\/auth\/sessions\/([^/]+)/);
    return decodeURIComponent(match?.[1] || '');
  }

  private requireCurrentUser(headers: Record<string, string>): DemoUserRecord {
    const authorization = headers.authorization || '';
    const token = String(authorization)
      .replace(/^Bearer\s+/i, '')
      .trim();
    const userId = this.userIdFromToken(token);
    return this.state.users.find(item => item.id === userId) || this.state.users[0];
  }

  private userIdFromToken(token: string): number {
    if (!token) return 1;
    const accessMatch = token.match(new RegExp(`^${demoAccessTokenPrefix}(\\d+)$`));
    if (accessMatch) return Number(accessMatch[1]);
    const refreshMatch = token.match(new RegExp(`^${demoRefreshTokenPrefix}(\\d+)$`));
    if (refreshMatch) return Number(refreshMatch[1]);
    return 1;
  }

  private tokenPair(userId: number) {
    return {
      token: `${demoAccessTokenPrefix}${userId}`,
      refreshToken: `${demoRefreshTokenPrefix}${userId}`
    };
  }

  private localeOptions(): Api.Language.LanguageOption[] {
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

  private runtimeMessages(query: URLSearchParams): Api.Language.RuntimeMessagesPayload {
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

  private themeScopePayload(): Api.Theme.ScopeConfigPayload {
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

  private roleByCode(roleCode: string): DemoRoleRecord {
    return this.state.roles.find(item => item.roleCode === roleCode) || this.state.roles[0];
  }

  private rolePermissions(roleCode: string): string[] {
    return [...this.roleByCode(roleCode).permissionCodes];
  }

  private resolveTenantScope(headers: Record<string, string>, user: DemoUserRecord): DemoTenantRecord | null {
    const requestedTenantId = Number(headers['x-tenant-id'] || 0);

    if (user.roleCode === 'R_SUPER') {
      if (!requestedTenantId) return null;
      return this.state.tenants.find(item => item.id === requestedTenantId) || null;
    }

    const tenantId = user.tenantId || requestedTenantId || 0;
    return this.state.tenants.find(item => item.id === tenantId) || null;
  }

  private tenantName(tenantId: number | null): string {
    if (!tenantId) return 'Platform';
    return this.state.tenants.find(item => item.id === tenantId)?.tenantName || 'Unknown Tenant';
  }

  private organizationName(organizationId: number | null): string {
    if (!organizationId) return '';
    return this.state.organizations.find(item => item.id === organizationId)?.organizationName || '';
  }

  private teamName(teamId: number | null): string {
    if (!teamId) return '';
    return this.state.teams.find(item => item.id === teamId)?.teamName || '';
  }

  private activeTenants(headers: Record<string, string>): Api.Tenant.TenantOption[] {
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

  private userInfo(headers: Record<string, string>): Api.Auth.UserInfo {
    const user = this.requireCurrentUser(headers);
    const scopedTenant = this.resolveTenantScope(headers, user);
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
      tenants: this.state.tenants.map(item => ({
        tenantId: String(item.id),
        tenantName: item.tenantName
      })),
      menuScope: scopedTenant ? 'tenant' : 'platform',
      menus: [],
      routeRules: {}
    };
  }

  private userMenus(headers: Record<string, string>) {
    const info = this.userInfo(headers);
    return {
      menuScope: info.menuScope,
      menus: info.menus,
      routeRules: info.routeRules
    };
  }

  private userProfile(headers: Record<string, string>): Api.Auth.UserProfile {
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

  private updateProfile(headers: Record<string, string>, body: Record<string, unknown>) {
    const user = this.requireCurrentUser(headers);
    const nextUserName = String(body.userName || user.userName).trim();
    const nextEmail = String(body.email || user.email)
      .trim()
      .toLowerCase();
    const errors: Record<string, string[]> = {};
    if (
      this.state.users.some(item => item.id !== user.id && item.userName.toLowerCase() === nextUserName.toLowerCase())
    ) {
      errors.userName = ['User name has already been taken'];
    }
    if (this.state.users.some(item => item.id !== user.id && item.email.toLowerCase() === nextEmail)) {
      errors.email = ['Email has already been taken'];
    }
    if (Object.keys(errors).length) return validation(errors);

    user.userName = nextUserName;
    user.email = nextEmail;
    user.timezone = String(body.timezone || user.timezone).trim() || user.timezone;
    user.updateTime = nowString();
    return ok(this.userProfile(headers), 'Profile updated');
  }

  private updatePreferences(headers: Record<string, string>, body: Record<string, unknown>) {
    const user = this.requireCurrentUser(headers);
    if (typeof body.themeSchema === 'string') user.themeSchema = body.themeSchema as UnionKey.ThemeScheme;
    if (typeof body.timezone === 'string' && body.timezone.trim()) user.timezone = body.timezone.trim();
    user.updateTime = nowString();
    return ok({ themeSchema: user.themeSchema, timezone: user.timezone }, 'Preferences updated');
  }

  private updatePreferredLocale(headers: Record<string, string>, body: Record<string, unknown>) {
    const user = this.requireCurrentUser(headers);
    const locale = String(body.locale || 'en-US') as App.I18n.LangType;
    user.locale = locale;
    user.updateTime = nowString();
    return ok({ locale, preferredLocale: locale }, 'Locale updated');
  }

  private userSessions(headers: Record<string, string>): Api.Auth.AuthSessionList {
    const user = this.requireCurrentUser(headers);
    return {
      singleDeviceLogin: false,
      records: this.state.sessions[user.id] || []
    };
  }

  private revokeSession(path: string, headers: Record<string, string>) {
    const user = this.requireCurrentUser(headers);
    const sessionId = this.parseSessionId(path);
    this.state.sessions[user.id] = (this.state.sessions[user.id] || []).filter(item => item.sessionId !== sessionId);
    return ok({ sessionId, deletedTokenCount: 2, revokedCurrentSession: false }, 'Session revoked');
  }

  private updateSessionAlias(path: string, headers: Record<string, string>, body: Record<string, unknown>) {
    const user = this.requireCurrentUser(headers);
    const sessionId = this.parseSessionId(path);
    const session = (this.state.sessions[user.id] || []).find(item => item.sessionId === sessionId);
    if (session) {
      session.deviceAlias = String(body.deviceAlias || session.deviceAlias).trim() || session.deviceAlias;
    }
    return ok(
      {
        sessionId,
        deviceAlias: session?.deviceAlias || 'Demo Browser',
        updatedTokenCount: 2,
        updatedCurrentSession: Boolean(session?.current)
      },
      'Session alias updated'
    );
  }

  private toggleTwoFactor(headers: Record<string, string>, body: Record<string, unknown>, enabled: boolean) {
    const user = this.requireCurrentUser(headers);
    const otpCode = String(body.otpCode || body.code || '').trim();
    if (otpCode !== '123456') {
      return fail(invalidTwoFactorCode, 'Two-factor code is invalid', 422);
    }
    user.twoFactorEnabled = enabled;
    user.updateTime = nowString();
    return ok({ enabled }, enabled ? 'Two-factor enabled' : 'Two-factor disabled');
  }

  private login(body: Record<string, unknown>) {
    const loginKey = String(body.userName || body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    const otpCode = String(body.otpCode || '').trim();
    const user = this.state.users.find(
      item => item.userName.toLowerCase() === loginKey || item.email.toLowerCase() === loginKey
    );
    if (!user || user.password !== password) {
      return fail(invalidCredentialsCode, 'Username or password is incorrect', 401);
    }
    if (user.twoFactorEnabled && otpCode !== '123456') {
      return fail(
        otpCode ? invalidTwoFactorCode : '4020',
        otpCode ? 'Two-factor code is invalid' : 'Two-factor code required',
        401
      );
    }
    this.appendAuditLog({
      action: 'auth.login',
      logType: 'login',
      user,
      tenantId: user.tenantId,
      target: user.userName,
      auditableType: 'user',
      auditableId: String(user.id),
      oldValues: {},
      newValues: {}
    });
    return ok(this.tokenPair(user.id), 'Login success');
  }

  private refreshToken(body: Record<string, unknown>) {
    const refreshToken = String(body.refreshToken || '').trim();
    const userId = this.userIdFromToken(refreshToken);
    if (!userId) return fail(unauthorizedCode, 'Session expired', 401);
    return ok(this.tokenPair(userId), 'Token refreshed');
  }

  private register(body: Record<string, unknown>) {
    const name = String(body.name || '').trim();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const errors: Record<string, string[]> = {};
    if (this.state.users.some(item => item.userName.toLowerCase() === name.toLowerCase()))
      errors.name = ['User name has already been taken'];
    if (this.state.users.some(item => item.email.toLowerCase() === email))
      errors.email = ['Email has already been taken'];
    if (Object.keys(errors).length) return validation(errors);

    const userId = this.state.users.length + 1;
    const createdAt = nowString();
    this.state.users.push({
      id: userId,
      tenantId: 1,
      organizationId: 1,
      teamId: 1,
      userName: name || `User${userId}`,
      email: email || `user${userId}@obsidian.demo`,
      password: String(body.password || '123456'),
      roleCode: 'R_USER',
      status: '1',
      locale: 'en-US',
      timezone: 'UTC',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: createdAt,
      updateTime: createdAt
    });
    this.state.sessions[userId] = [
      {
        sessionId: `demo-session-${userId}`,
        current: true,
        legacy: false,
        rememberMe: false,
        hasAccessToken: true,
        hasRefreshToken: true,
        tokenCount: 2,
        deviceAlias: 'New Demo Session',
        deviceName: 'Browser Preview',
        browser: 'Chromium',
        os: 'Web',
        deviceType: 'desktop',
        ipAddress: '127.0.0.1',
        createdAt,
        lastUsedAt: createdAt,
        lastAccessUsedAt: createdAt,
        lastRefreshUsedAt: createdAt,
        accessTokenExpiresAt: addMinutes(createdAt, 60),
        refreshTokenExpiresAt: addMinutes(createdAt, 60 * 24 * 7)
      }
    ];
    return ok(this.tokenPair(userId), 'Register success');
  }

  private resetPassword(body: Record<string, unknown>) {
    const token = String(body.token || '').trim();
    if (token !== 'demo-reset-token') {
      return validation({ token: ['Reset token is invalid'] });
    }
    return ok({}, 'Password has been reset');
  }

  private tenantList(query: URLSearchParams, headers: Record<string, string>): Api.Tenant.TenantList {
    const actor = this.requireCurrentUser(headers);
    let items = [...this.state.tenants];
    if (actor.roleCode !== 'R_SUPER' && actor.tenantId) items = items.filter(item => item.id === actor.tenantId);
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    if (keyword)
      items = items.filter(
        item => item.tenantCode.toLowerCase().includes(keyword) || item.tenantName.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    return paginate(
      items.map(item => ({
        id: item.id,
        tenantCode: item.tenantCode,
        tenantName: item.tenantName,
        status: item.status,
        userCount: this.state.users.filter(user => user.tenantId === item.id).length,
        createTime: item.createTime,
        updateTime: item.updateTime
      })),
      query
    );
  }

  private createTenant(body: Record<string, unknown>, headers: Record<string, string>) {
    const tenantCode = String(body.tenantCode || '')
      .trim()
      .toUpperCase();
    if (this.state.tenants.some(item => item.tenantCode === tenantCode))
      return validation({ tenantCode: ['Tenant code has already been taken'] });
    const now = nowString();
    const record: DemoTenantRecord = {
      id: this.state.tenants.length + 1,
      tenantCode,
      tenantName: String(body.tenantName || '').trim() || `Tenant ${this.state.tenants.length + 1}`,
      status: String(body.status || '1') === '2' ? '2' : '1',
      createTime: now,
      updateTime: now
    };
    this.state.tenants.push(record);
    this.appendAuditLogFromHeaders(
      headers,
      'tenant.create',
      record.id,
      'tenant',
      String(record.id),
      {},
      toSnapshot(record)
    );
    return ok({}, 'Add success');
  }

  private updateTenant(path: string, body: Record<string, unknown>, headers: Record<string, string>) {
    const id = this.parseId(path);
    const record = this.state.tenants.find(item => item.id === id);
    if (!record) return fail('4040', 'Tenant not found', 404);
    const nextCode = String(body.tenantCode || record.tenantCode)
      .trim()
      .toUpperCase();
    if (this.state.tenants.some(item => item.id !== id && item.tenantCode === nextCode))
      return validation({ tenantCode: ['Tenant code has already been taken'] });
    const previous = toSnapshot(record);
    record.tenantCode = nextCode;
    record.tenantName = String(body.tenantName || record.tenantName).trim() || record.tenantName;
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.updateTime = nowString();
    this.appendAuditLogFromHeaders(
      headers,
      'tenant.update',
      record.id,
      'tenant',
      String(record.id),
      previous,
      toSnapshot(record)
    );
    return ok({}, 'Update success');
  }

  private deleteTenant(path: string) {
    const id = this.parseId(path);
    this.state.tenants = this.state.tenants.filter(item => item.id !== id);
    return ok({}, 'Delete success');
  }

  private organizationList(query: URLSearchParams, headers: Record<string, string>): Api.Organization.OrganizationList {
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    let items = [...this.state.organizations];
    if (scopedTenantId) items = items.filter(item => item.tenantId === scopedTenantId);
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    if (keyword)
      items = items.filter(
        item =>
          item.organizationCode.toLowerCase().includes(keyword) || item.organizationName.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    return paginate(
      items.map(item => ({
        id: item.id,
        tenantId: String(item.tenantId),
        tenantName: this.tenantName(item.tenantId),
        organizationCode: item.organizationCode,
        organizationName: item.organizationName,
        description: item.description,
        status: item.status,
        sort: item.sort,
        teamCount: this.state.teams.filter(team => team.organizationId === item.id).length,
        userCount: this.state.users.filter(user => user.organizationId === item.id).length,
        createTime: item.createTime,
        updateTime: item.updateTime
      })),
      query
    );
  }

  private organizationOptions(headers: Record<string, string>): Api.Organization.OrganizationOption[] {
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    return this.state.organizations
      .filter(item => item.status === '1' && (!scopedTenantId || item.tenantId === scopedTenantId))
      .map(item => ({
        id: item.id,
        organizationCode: item.organizationCode,
        organizationName: item.organizationName
      }));
  }

  private createOrganization(body: Record<string, unknown>, headers: Record<string, string>) {
    const tenant = this.resolveTenantScope(headers, this.requireCurrentUser(headers)) || this.state.tenants[0];
    const organizationCode = String(body.organizationCode || '')
      .trim()
      .toUpperCase();
    if (
      this.state.organizations.some(item => item.tenantId === tenant.id && item.organizationCode === organizationCode)
    )
      return validation({
        organizationCode: ['Organization code has already been taken']
      });
    const now = nowString();
    this.state.organizations.push({
      id: this.state.organizations.length + 1,
      tenantId: tenant.id,
      organizationCode,
      organizationName:
        String(body.organizationName || '').trim() || `Organization ${this.state.organizations.length + 1}`,
      description: String(body.description || '').trim(),
      status: String(body.status || '1') === '2' ? '2' : '1',
      sort: Number(body.sort || 0),
      createTime: now,
      updateTime: now
    });
    return ok({}, 'Add success');
  }

  private updateOrganization(path: string, body: Record<string, unknown>, _headers: Record<string, string>) {
    const id = this.parseId(path);
    const record = this.state.organizations.find(item => item.id === id);
    if (!record) return fail('4040', 'Organization not found', 404);
    const nextCode = String(body.organizationCode || record.organizationCode)
      .trim()
      .toUpperCase();
    if (
      this.state.organizations.some(
        item => item.id !== id && item.tenantId === record.tenantId && item.organizationCode === nextCode
      )
    )
      return validation({
        organizationCode: ['Organization code has already been taken']
      });
    record.organizationCode = nextCode;
    record.organizationName =
      String(body.organizationName || record.organizationName).trim() || record.organizationName;
    record.description = String(body.description || record.description);
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.sort = Number(body.sort ?? record.sort);
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private deleteOrganization(path: string) {
    const id = this.parseId(path);
    this.state.organizations = this.state.organizations.filter(item => item.id !== id);
    this.state.teams = this.state.teams.filter(item => item.organizationId !== id);
    return ok({}, 'Delete success');
  }

  private teamList(query: URLSearchParams, headers: Record<string, string>): Api.Team.TeamList {
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    let items = [...this.state.teams];
    if (scopedTenantId) items = items.filter(item => item.tenantId === scopedTenantId);
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    const organizationId = Number(query.get('organizationId') || 0);
    if (keyword)
      items = items.filter(
        item => item.teamCode.toLowerCase().includes(keyword) || item.teamName.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    if (organizationId) items = items.filter(item => item.organizationId === organizationId);
    return paginate(
      items.map(item => ({
        id: item.id,
        tenantId: String(item.tenantId),
        organizationId: String(item.organizationId),
        organizationName: this.organizationName(item.organizationId),
        teamCode: item.teamCode,
        teamName: item.teamName,
        description: item.description,
        status: item.status,
        sort: item.sort,
        userCount: this.state.users.filter(user => user.teamId === item.id).length,
        createTime: item.createTime,
        updateTime: item.updateTime
      })),
      query
    );
  }

  private teamOptions(query: URLSearchParams, headers: Record<string, string>): Api.Team.TeamOption[] {
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    const organizationId = Number(query.get('organizationId') || 0);
    return this.state.teams
      .filter(
        item =>
          item.status === '1' &&
          (!scopedTenantId || item.tenantId === scopedTenantId) &&
          (!organizationId || item.organizationId === organizationId)
      )
      .map(item => ({
        id: item.id,
        organizationId: String(item.organizationId),
        teamCode: item.teamCode,
        teamName: item.teamName
      }));
  }

  private createTeam(body: Record<string, unknown>, _headers: Record<string, string>) {
    const organizationId = Number(body.organizationId || 0);
    const organization = this.state.organizations.find(item => item.id === organizationId);
    if (!organization) return validation({ organizationId: ['Organization is required'] });
    const teamCode = String(body.teamCode || '')
      .trim()
      .toUpperCase();
    if (this.state.teams.some(item => item.organizationId === organizationId && item.teamCode === teamCode))
      return validation({ teamCode: ['Team code has already been taken'] });
    const now = nowString();
    this.state.teams.push({
      id: this.state.teams.length + 1,
      tenantId: organization.tenantId,
      organizationId,
      teamCode,
      teamName: String(body.teamName || '').trim() || `Team ${this.state.teams.length + 1}`,
      description: String(body.description || '').trim(),
      status: String(body.status || '1') === '2' ? '2' : '1',
      sort: Number(body.sort || 0),
      createTime: now,
      updateTime: now
    });
    return ok({}, 'Add success');
  }

  private updateTeam(path: string, body: Record<string, unknown>, _headers: Record<string, string>) {
    const id = this.parseId(path);
    const record = this.state.teams.find(item => item.id === id);
    if (!record) return fail('4040', 'Team not found', 404);
    const organizationId = Number(body.organizationId || record.organizationId);
    const nextCode = String(body.teamCode || record.teamCode)
      .trim()
      .toUpperCase();
    if (
      this.state.teams.some(
        item => item.id !== id && item.organizationId === organizationId && item.teamCode === nextCode
      )
    )
      return validation({ teamCode: ['Team code has already been taken'] });
    record.organizationId = organizationId;
    record.tenantId = this.state.organizations.find(item => item.id === organizationId)?.tenantId || record.tenantId;
    record.teamCode = nextCode;
    record.teamName = String(body.teamName || record.teamName).trim() || record.teamName;
    record.description = String(body.description || record.description);
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.sort = Number(body.sort ?? record.sort);
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private deleteTeam(path: string) {
    const id = this.parseId(path);
    this.state.teams = this.state.teams.filter(item => item.id !== id);
    return ok({}, 'Delete success');
  }

  private permissionList(query: URLSearchParams): Api.Permission.PermissionList {
    let items = [...this.state.permissions];
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    const group = String(query.get('group') || '')
      .trim()
      .toLowerCase();
    if (keyword)
      items = items.filter(
        item =>
          item.permissionCode.toLowerCase().includes(keyword) || item.permissionName.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    if (group) items = items.filter(item => item.group.toLowerCase() === group);
    return paginate(
      items.map(item => ({
        id: item.id,
        permissionCode: item.permissionCode,
        permissionName: item.permissionName,
        group: item.group,
        description: item.description,
        status: item.status,
        roleCount: this.state.roles.filter(role => role.permissionCodes.includes(item.permissionCode)).length,
        createTime: item.createTime,
        updateTime: item.updateTime
      })),
      query
    );
  }

  private permissionOptions(): Api.Permission.PermissionOption[] {
    return this.state.permissions
      .filter(item => item.status === '1')
      .map(item => ({
        id: item.id,
        permissionCode: item.permissionCode,
        permissionName: item.permissionName,
        group: item.group
      }));
  }

  private createPermission(body: Record<string, unknown>) {
    const permissionCode = String(body.permissionCode || '').trim();
    if (this.state.permissions.some(item => item.permissionCode === permissionCode))
      return validation({
        permissionCode: ['Permission code has already been taken']
      });
    const now = nowString();
    this.state.permissions.push({
      id: this.state.permissions.length + 1,
      permissionCode,
      permissionName: String(body.permissionName || '').trim() || permissionCode,
      group: String(body.group || 'system').trim() || 'system',
      description: String(body.description || '').trim(),
      status: String(body.status || '1') === '2' ? '2' : '1',
      createTime: now,
      updateTime: now
    });
    return ok({}, 'Add success');
  }

  private updatePermission(path: string, body: Record<string, unknown>) {
    const id = this.parseId(path);
    const record = this.state.permissions.find(item => item.id === id);
    if (!record) return fail('4040', 'Permission not found', 404);
    const nextCode = String(body.permissionCode || record.permissionCode).trim();
    if (this.state.permissions.some(item => item.id !== id && item.permissionCode === nextCode))
      return validation({
        permissionCode: ['Permission code has already been taken']
      });
    record.permissionCode = nextCode;
    record.permissionName = String(body.permissionName || record.permissionName).trim() || record.permissionName;
    record.group = String(body.group || record.group).trim() || record.group;
    record.description = String(body.description || record.description);
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private deletePermission(path: string) {
    const id = this.parseId(path);
    this.state.permissions = this.state.permissions.filter(item => item.id !== id);
    return ok({}, 'Delete success');
  }

  private roleList(query: URLSearchParams, headers: Record<string, string>): Api.Role.RoleList {
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    let items = [...this.state.roles];
    if (scopedTenantId) items = items.filter(item => item.tenantId === null || item.tenantId === scopedTenantId);
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    const level = Number(query.get('level') || 0);
    if (keyword)
      items = items.filter(
        item => item.roleCode.toLowerCase().includes(keyword) || item.roleName.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    if (level) items = items.filter(item => item.level === level);
    const actorLevel = this.roleByCode(this.requireCurrentUser(headers).roleCode).level;
    return {
      ...paginate(
        items.map(item => ({
          id: item.id,
          roleCode: item.roleCode,
          roleName: item.roleName,
          tenantId: item.tenantId ? String(item.tenantId) : '',
          tenantName: this.tenantName(item.tenantId),
          description: item.description,
          status: item.status,
          level: item.level,
          manageable: item.level < actorLevel,
          userCount: this.state.users.filter(user => user.roleCode === item.roleCode).length,
          permissionCodes: [...item.permissionCodes],
          createTime: item.createTime,
          updateTime: item.updateTime
        })),
        query
      ),
      actorLevel
    };
  }

  private roleOptions(query: URLSearchParams, headers: Record<string, string>): Api.Role.RoleOption[] {
    const manageableOnly = String(query.get('manageableOnly') || '') === 'true';
    const actor = this.requireCurrentUser(headers);
    const actorLevel = this.roleByCode(actor.roleCode).level;
    const scopedTenantId = this.resolveTenantScope(headers, actor)?.id ?? null;
    return this.state.roles
      .filter(
        item => item.status === '1' && (!scopedTenantId || item.tenantId === null || item.tenantId === scopedTenantId)
      )
      .filter(item => !manageableOnly || item.level < actorLevel)
      .map(item => ({
        id: item.id,
        roleCode: item.roleCode,
        roleName: item.roleName,
        level: item.level,
        manageable: item.level < actorLevel
      }));
  }

  private createRole(body: Record<string, unknown>, headers: Record<string, string>) {
    const roleCode = String(body.roleCode || '')
      .trim()
      .toUpperCase();
    const level = Number(body.level || 0);
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    if (this.state.roles.some(item => item.roleCode === roleCode))
      return validation({ roleCode: ['Role code has already been taken'] });
    if (this.state.roles.some(item => item.level === level && item.tenantId === scopedTenantId))
      return validation({ level: ['Role level has already been taken'] });
    const now = nowString();
    this.state.roles.push({
      id: this.state.roles.length + 1,
      roleCode,
      roleName: String(body.roleName || '').trim() || roleCode,
      tenantId: scopedTenantId,
      description: String(body.description || '').trim(),
      status: String(body.status || '1') === '2' ? '2' : '1',
      level,
      permissionCodes: Array.isArray(body.permissionCodes) ? body.permissionCodes.map(code => String(code)) : [],
      createTime: now,
      updateTime: now
    });
    return ok({}, 'Add success');
  }

  private updateRole(path: string, body: Record<string, unknown>, _headers: Record<string, string>) {
    const id = this.parseId(path);
    const record = this.state.roles.find(item => item.id === id);
    if (!record) return fail('4040', 'Role not found', 404);
    const nextCode = String(body.roleCode || record.roleCode)
      .trim()
      .toUpperCase();
    const nextLevel = Number(body.level || record.level);
    const errors: Record<string, string[]> = {};
    if (this.state.roles.some(item => item.id !== id && item.roleCode === nextCode))
      errors.roleCode = ['Role code has already been taken'];
    if (this.state.roles.some(item => item.id !== id && item.level === nextLevel && item.tenantId === record.tenantId))
      errors.level = ['Role level has already been taken'];
    if (Object.keys(errors).length) return validation(errors);
    record.roleCode = nextCode;
    record.roleName = String(body.roleName || record.roleName).trim() || record.roleName;
    record.description = String(body.description || record.description);
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.level = nextLevel;
    if (Array.isArray(body.permissionCodes)) record.permissionCodes = body.permissionCodes.map(code => String(code));
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private syncRolePermissions(path: string, body: Record<string, unknown>) {
    const id = this.parseId(path);
    const record = this.state.roles.find(item => item.id === id);
    if (!record) return fail('4040', 'Role not found', 404);
    record.permissionCodes = Array.isArray(body.permissionCodes) ? body.permissionCodes.map(code => String(code)) : [];
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private deleteRole(path: string) {
    const id = this.parseId(path);
    this.state.roles = this.state.roles.filter(item => item.id !== id);
    return ok({}, 'Delete success');
  }

  private userList(query: URLSearchParams, headers: Record<string, string>): Api.User.UserList {
    const actor = this.requireCurrentUser(headers);
    const actorLevel = this.roleByCode(actor.roleCode).level;
    const scopedTenantId = this.resolveTenantScope(headers, actor)?.id ?? null;
    let items = [...this.state.users];
    if (scopedTenantId) items = items.filter(item => item.tenantId === scopedTenantId);
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    const userName = String(query.get('userName') || '')
      .trim()
      .toLowerCase();
    const userEmail = String(query.get('userEmail') || '')
      .trim()
      .toLowerCase();
    const roleCode = String(query.get('roleCode') || '').trim();
    if (keyword)
      items = items.filter(
        item => item.userName.toLowerCase().includes(keyword) || item.email.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    if (userName) items = items.filter(item => item.userName.toLowerCase().includes(userName));
    if (userEmail) items = items.filter(item => item.email.toLowerCase().includes(userEmail));
    if (roleCode) items = items.filter(item => item.roleCode === roleCode);
    return {
      ...paginate(
        items.map(item => ({
          id: item.id,
          userName: item.userName,
          email: item.email,
          roleCode: item.roleCode,
          roleName: this.roleByCode(item.roleCode).roleName,
          roleLevel: this.roleByCode(item.roleCode).level,
          organizationId: item.organizationId ? String(item.organizationId) : '',
          organizationName: this.organizationName(item.organizationId),
          teamId: item.teamId ? String(item.teamId) : '',
          teamName: this.teamName(item.teamId),
          status: item.status,
          manageable: this.roleByCode(item.roleCode).level < actorLevel,
          createTime: item.createTime,
          updateTime: item.updateTime
        })),
        query
      ),
      actorLevel
    };
  }

  private createUser(body: Record<string, unknown>, headers: Record<string, string>) {
    const userName = String(body.userName || '').trim();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const errors: Record<string, string[]> = {};
    if (this.state.users.some(item => item.userName.toLowerCase() === userName.toLowerCase()))
      errors.userName = ['User name has already been taken'];
    if (this.state.users.some(item => item.email.toLowerCase() === email))
      errors.email = ['Email has already been taken'];
    if (Object.keys(errors).length) return validation(errors);
    const actor = this.requireCurrentUser(headers);
    const tenantId = this.resolveTenantScope(headers, actor)?.id ?? actor.tenantId ?? 1;
    const now = nowString();
    this.state.users.push({
      id: this.state.users.length + 1,
      tenantId,
      organizationId: Number(body.organizationId || 0) || null,
      teamId: Number(body.teamId || 0) || null,
      userName,
      email,
      password: String(body.password || '123456'),
      roleCode: String(body.roleCode || 'R_USER'),
      status: String(body.status || '1') === '2' ? '2' : '1',
      locale: 'en-US',
      timezone: 'UTC',
      themeSchema: 'light',
      twoFactorEnabled: false,
      createTime: now,
      updateTime: now
    });
    return ok({}, 'Add success');
  }

  private updateUser(path: string, body: Record<string, unknown>, _headers: Record<string, string>) {
    const id = this.parseId(path);
    const record = this.state.users.find(item => item.id === id);
    if (!record) return fail('4040', 'User not found', 404);
    const nextUserName = String(body.userName || record.userName).trim();
    const nextEmail = String(body.email || record.email)
      .trim()
      .toLowerCase();
    const errors: Record<string, string[]> = {};
    if (this.state.users.some(item => item.id !== id && item.userName.toLowerCase() === nextUserName.toLowerCase()))
      errors.userName = ['User name has already been taken'];
    if (this.state.users.some(item => item.id !== id && item.email.toLowerCase() === nextEmail))
      errors.email = ['Email has already been taken'];
    if (Object.keys(errors).length) return validation(errors);
    record.userName = nextUserName;
    record.email = nextEmail;
    record.roleCode = String(body.roleCode || record.roleCode);
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.organizationId = Number(body.organizationId || 0) || null;
    record.teamId = Number(body.teamId || 0) || null;
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private assignUserRole(path: string, body: Record<string, unknown>) {
    const id = this.parseId(path);
    const record = this.state.users.find(item => item.id === id);
    if (!record) return fail('4040', 'User not found', 404);
    record.roleCode = String(body.roleCode || record.roleCode);
    record.updateTime = nowString();
    return ok({}, 'Update success');
  }

  private deleteUser(path: string) {
    const id = this.parseId(path);
    this.state.users = this.state.users.filter(item => item.id !== id);
    return ok({}, 'Delete success');
  }

  private featureFlagList(query: URLSearchParams): Api.FeatureFlag.Flag[] {
    let items = [...this.state.featureFlags];
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    if (keyword) items = items.filter(item => item.key.toLowerCase().includes(keyword));
    return items.map(item => ({
      key: item.key,
      enabled: item.enabled,
      percentage: item.percentage,
      platform_only: item.platformOnly,
      tenant_only: item.tenantOnly,
      role_codes: [...item.roleCodes],
      global_override: item.globalOverride
    }));
  }

  private toggleFeatureFlag(body: Record<string, unknown>, headers: Record<string, string>) {
    const key = String(body.key || '').trim();
    const record = this.state.featureFlags.find(item => item.key === key);
    if (!record) return fail('4040', 'Feature flag not found', 404);
    record.globalOverride = Boolean(body.enabled);
    this.appendAuditLogFromHeaders(
      headers,
      'feature-flag.toggle',
      null,
      'feature-flag',
      key,
      {},
      { global_override: record.globalOverride }
    );
    return ok({ key, global_override: Boolean(record.globalOverride) }, 'Feature flag updated');
  }

  private purgeFeatureFlag(body: Record<string, unknown>, headers: Record<string, string>) {
    const key = String(body.key || '').trim();
    const record = this.state.featureFlags.find(item => item.key === key);
    if (!record) return fail('4040', 'Feature flag not found', 404);
    record.globalOverride = null;
    this.appendAuditLogFromHeaders(
      headers,
      'feature-flag.purge',
      null,
      'feature-flag',
      key,
      {},
      { global_override: null }
    );
    return ok({ key, global_override: null }, 'Feature flag overrides purged');
  }

  private languageList(query: URLSearchParams): Api.Language.TranslationList {
    let items = [...this.state.languages];
    const locale = String(query.get('locale') || '').trim() as App.I18n.LangType;
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const status = String(query.get('status') || '').trim();
    if (locale) items = items.filter(item => item.locale === locale);
    if (keyword)
      items = items.filter(
        item =>
          item.translationKey.toLowerCase().includes(keyword) || item.translationValue.toLowerCase().includes(keyword)
      );
    if (status) items = items.filter(item => item.status === status);
    return paginate(items, query);
  }

  private createLanguage(body: Record<string, unknown>) {
    const locale = String(body.locale || 'en-US') as App.I18n.LangType;
    const translationKey = String(body.translationKey || '').trim();
    if (this.state.languages.some(item => item.locale === locale && item.translationKey === translationKey))
      return validation({
        translationKey: ['Translation key already exists for this locale']
      });
    const now = nowString();
    this.state.languages.push({
      id: this.state.languages.length + 1,
      locale,
      localeName: locale === 'zh-CN' ? '简体中文' : 'English',
      translationKey,
      translationValue: String(body.translationValue || '').trim(),
      description: String(body.description || '').trim(),
      status: String(body.status || '1') === '2' ? '2' : '1',
      createTime: now,
      updateTime: now
    });
    this.state.languageVersion += 1;
    return ok({}, 'Add success');
  }

  private updateLanguage(path: string, body: Record<string, unknown>) {
    const id = this.parseId(path);
    const record = this.state.languages.find(item => item.id === id);
    if (!record) return fail('4040', 'Language item not found', 404);
    const locale = String(body.locale || record.locale) as App.I18n.LangType;
    const translationKey = String(body.translationKey || record.translationKey).trim();
    if (
      this.state.languages.some(
        item => item.id !== id && item.locale === locale && item.translationKey === translationKey
      )
    )
      return validation({
        translationKey: ['Translation key already exists for this locale']
      });
    record.locale = locale;
    record.localeName = locale === 'zh-CN' ? '简体中文' : 'English';
    record.translationKey = translationKey;
    record.translationValue = String(body.translationValue || record.translationValue).trim();
    record.description = String(body.description || record.description).trim();
    record.status = String(body.status || record.status) === '2' ? '2' : '1';
    record.updateTime = nowString();
    this.state.languageVersion += 1;
    return ok({}, 'Update success');
  }

  private deleteLanguage(path: string) {
    const id = this.parseId(path);
    this.state.languages = this.state.languages.filter(item => item.id !== id);
    this.state.languageVersion += 1;
    return ok({}, 'Delete success');
  }

  private auditLogList(query: URLSearchParams, headers: Record<string, string>): Api.Audit.AuditLogList {
    const scopedTenantId = this.resolveTenantScope(headers, this.requireCurrentUser(headers))?.id ?? null;
    let items = [...this.state.auditLogs];
    const keyword = String(query.get('keyword') || '')
      .trim()
      .toLowerCase();
    const action = String(query.get('action') || '')
      .trim()
      .toLowerCase();
    const logType = String(query.get('logType') || '')
      .trim()
      .toLowerCase();
    const userName = String(query.get('userName') || '')
      .trim()
      .toLowerCase();
    const requestId = String(query.get('requestId') || '')
      .trim()
      .toLowerCase();
    if (scopedTenantId) items = items.filter(item => item.tenantId === String(scopedTenantId));
    if (keyword)
      items = items.filter(
        item => item.action.toLowerCase().includes(keyword) || item.target.toLowerCase().includes(keyword)
      );
    if (action) items = items.filter(item => item.action.toLowerCase().includes(action));
    if (logType) items = items.filter(item => item.logType === logType);
    if (userName) items = items.filter(item => item.userName.toLowerCase().includes(userName));
    if (requestId) items = items.filter(item => item.requestId.toLowerCase().includes(requestId));
    return paginate(items, query);
  }

  private updateAuditPolicy(body: Record<string, unknown>, headers: Record<string, string>) {
    const records = Array.isArray(body.records) ? body.records : [];
    const changeReason = String(body.changeReason || '').trim();
    if (changeReason.length < 3)
      return validation({
        changeReason: ['Change reason must be at least 3 characters']
      });
    const changedActions: string[] = [];
    records.forEach(item => {
      const record = item as Record<string, unknown>;
      const policy = this.state.auditPolicies.find(entry => entry.action === String(record.action || ''));
      if (!policy || policy.locked) return;
      policy.enabled = Boolean(record.enabled);
      if (record.samplingRate !== null && record.samplingRate !== undefined) {
        policy.samplingRate = Number(record.samplingRate);
      }
      if (record.retentionDays !== null && record.retentionDays !== undefined) {
        policy.retentionDays = Number(record.retentionDays);
      }
      policy.source = 'platform';
      changedActions.push(policy.action);
    });
    this.state.revisionCounter += 1;
    const actor = this.requireCurrentUser(headers);
    this.state.auditPolicyHistory.unshift({
      id: `revision-${this.state.revisionCounter}`,
      scope: 'platform',
      changedByUserId: String(actor.id),
      changedByUserName: actor.userName,
      changeReason,
      changedCount: changedActions.length,
      changedActions,
      createdAt: nowString()
    });
    return ok(
      {
        updated: changedActions.length,
        revisionId: `revision-${this.state.revisionCounter}`,
        records: this.state.auditPolicies,
        clearedTenantOverrides: 0
      },
      'Audit policy updated'
    );
  }

  private crudSchema(path: string): Api.CrudSchema.Schema {
    const resource = path.split('/').pop() || 'unknown';
    const schemaMap: Record<string, Api.CrudSchema.Schema> = {
      user: {
        resource: 'user',
        permission: 'user.view',
        searchFields: [
          {
            key: 'keyword',
            type: 'input',
            labelKey: 'common.keyword',
            placeholderKey: 'common.search'
          },
          {
            key: 'roleCode',
            type: 'select',
            labelKey: 'route.role',
            optionSource: 'role.all'
          }
        ],
        columns: [
          {
            key: 'userName',
            type: 'text',
            titleKey: 'page.user.userName',
            align: 'left',
            minWidth: 160
          },
          {
            key: 'email',
            type: 'text',
            titleKey: 'common.email',
            align: 'left',
            minWidth: 220
          },
          {
            key: 'status',
            type: 'status',
            titleKey: 'common.status',
            align: 'center',
            width: 120
          }
        ],
        scrollX: 1280
      },
      role: {
        resource: 'role',
        permission: 'role.view',
        searchFields: [
          {
            key: 'keyword',
            type: 'input',
            labelKey: 'common.keyword',
            placeholderKey: 'common.search'
          }
        ],
        columns: [
          {
            key: 'roleCode',
            type: 'text',
            titleKey: 'page.role.roleCode',
            align: 'left',
            minWidth: 160
          },
          {
            key: 'roleName',
            type: 'text',
            titleKey: 'page.role.roleName',
            align: 'left',
            minWidth: 180
          },
          {
            key: 'status',
            type: 'status',
            titleKey: 'common.status',
            align: 'center',
            width: 120
          }
        ],
        scrollX: 1180
      }
    };

    return (
      schemaMap[resource] || {
        resource,
        permission: `${resource}.view`,
        searchFields: [],
        columns: [],
        scrollX: 1080
      }
    );
  }

  private updateThemeConfig(body: Record<string, unknown>) {
    Object.assign(this.state.themeConfig, body);
    return ok(this.themeScopePayload(), 'Theme configuration updated');
  }

  private appendAuditLog(params: {
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

  private appendAuditLogFromHeaders(
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
    const requestUrl = new URL(config.url || '/', config.baseURL || window.location.origin);
    const path = normalizeDemoFetchPath(requestUrl.pathname);
    const response = await backend.handle({
      method: String(config.method || 'GET').toUpperCase(),
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
      config,
      request: { demo: true }
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
    path.startsWith('/language') ||
    path.startsWith('/theme/') ||
    path.startsWith('/audit/') ||
    path.startsWith('/system/') ||
    path.startsWith('/health')
  );
}
