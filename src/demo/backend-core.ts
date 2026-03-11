/* eslint-disable complexity */

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

export type EnableStatus = '1' | '2';
export type AuditLogType = 'login' | 'api' | 'operation' | 'data' | 'permission';

export interface DemoTenantRecord {
  id: number;
  tenantCode: string;
  tenantName: string;
  status: EnableStatus;
  createTime: string;
  updateTime: string;
}

export interface DemoOrganizationRecord {
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

export interface DemoTeamRecord {
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

export interface DemoPermissionRecord {
  id: number;
  permissionCode: string;
  permissionName: string;
  group: string;
  description: string;
  status: EnableStatus;
  createTime: string;
  updateTime: string;
}

export interface DemoRoleRecord {
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

export interface DemoUserRecord {
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

export interface DemoLanguageRecord {
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

export interface DemoFeatureFlagRecord {
  key: string;
  enabled: boolean;
  percentage: number;
  platformOnly: boolean;
  tenantOnly: boolean;
  roleCodes: string[];
  globalOverride: boolean | null;
}

export interface DemoAuditPolicyRecord {
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

export interface DemoAuditPolicyHistoryRecord {
  id: string;
  scope: string;
  changedByUserId: string;
  changedByUserName: string;
  changeReason: string;
  changedCount: number;
  changedActions: string[];
  createdAt: string;
}

export interface DemoAuditLogRecord {
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

export interface DemoSessionRecord {
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

export interface DemoState {
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

export const successCode = '0000';
export const validationCode = '1002';
export const unauthorizedCode = '8888';
export const invalidCredentialsCode = '4010';
export const invalidTwoFactorCode = '4021';
export const demoAccessTokenPrefix = 'demo-access-user-';
export const demoRefreshTokenPrefix = 'demo-refresh-user-';
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
export const defaultTimezoneOptions: Api.Auth.TimezoneOption[] = [
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
export const defaultThemeConfig: Api.Theme.Config = {
  themeScheme: 'light',
  themeColor: '#5b8cff',
  themeRadius: 6,
  headerHeight: 56,
  siderWidth: 220,
  siderCollapsedWidth: 64,
  layoutMode: 'vertical',
  scrollMode: 'content',
  darkSider: true,
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

export function nowString(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function addMinutes(time: string, minutes: number): string {
  const date = new Date(`${time.replace(' ', 'T')}Z`);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function normalizePath(pathname: string): string {
  return pathname.replace(/^\/proxy-default/, '').replace(/^\/api\/v\d+/, '');
}

export function normalizeHeaders(headers: unknown): Record<string, string> {
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

export function parseBody(data: unknown): Record<string, unknown> {
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

export function ok<T>(data: T, msg = 'ok'): DemoBackendResponse<T> {
  return {
    status: 200,
    body: {
      code: successCode,
      msg,
      data
    }
  };
}

export function validation(
  errors: Record<string, string[]>
): DemoBackendResponse<{ errors: Record<string, string[]> }> {
  return {
    status: 422,
    body: {
      code: validationCode,
      msg: 'Validation failed',
      data: { errors }
    }
  };
}

export function fail(code: string, msg: string, status = 400): DemoBackendResponse<Record<string, never>> {
  return {
    status,
    body: {
      code,
      msg,
      data: {}
    }
  };
}

export function paginate<T>(items: T[], query: URLSearchParams) {
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

export function toSnapshot(value: object): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

export function createInitialState(): DemoState {
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
    organizations: [],
    teams: [],
    permissions,
    roles,
    users,
    languages: [],
    featureFlags: [],
    auditPolicies: [],
    auditPolicyHistory: [],
    auditLogs,
    sessions,
    themeConfig: { ...defaultThemeConfig },
    revisionCounter: 1,
    auditLogCounter: auditLogs.length,
    languageVersion: 0
  };
}

export function createInitialTenantExtensions(createdAt = nowString()): Pick<DemoState, 'organizations' | 'teams'> {
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

  return { organizations, teams };
}

export function createInitialSystemState(
  createdAt = nowString()
): Pick<DemoState, 'languages' | 'featureFlags' | 'auditPolicies' | 'auditPolicyHistory' | 'languageVersion'> {
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

  return {
    languages,
    featureFlags,
    auditPolicies,
    auditPolicyHistory,
    languageVersion: 1
  };
}

export function cloneThemeConfig(config: Api.Theme.Config): Api.Theme.Config {
  return JSON.parse(JSON.stringify(config)) as Api.Theme.Config;
}
