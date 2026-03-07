import type { Page, Route } from '@playwright/test';

interface MockUserRecord {
  id: number;
  userName: string;
  email: string;
  roleCode: string;
  roleName: string;
  status: '1' | '2';
  createTime: string;
  updateTime: string;
}

export interface MockApiState {
  users: MockUserRecord[];
  currentUser: MockUserRecord;
  resetTokens: Record<string, string>;
}

interface MockApiOptions {
  userPermissions?: string[];
}

type StaticHandler = (route: Route, state: MockApiState) => Promise<void>;

function normalizePath(pathname: string) {
  return pathname.replace(/^\/proxy-default/, '').replace(/^\/api\/v\d+/, '');
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function parseJsonBody(route: Route): Record<string, unknown> {
  try {
    const payload = route.request().postDataJSON();
    return (payload || {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function resolveRoleName(roleCode: string): string {
  if (roleCode === 'R_ADMIN') {
    return 'Admin';
  }

  if (roleCode === 'R_SUPER') {
    return 'Super Admin';
  }

  return 'User';
}

function createAuthUserInfo(user: MockUserRecord, permissions: string[]) {
  return {
    userId: String(user.id),
    userName: user.userName,
    locale: 'en-US',
    preferredLocale: 'en-US',
    timezone: 'UTC',
    themeSchema: 'light',
    roles: [user.roleCode],
    buttons: permissions,
    currentTenantId: '',
    currentTenantName: 'No Tenants',
    tenants: [],
    menuScope: 'platform',
    menus: [],
    routeRules: {}
  };
}

async function fulfill(route: Route, payload: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload)
  });
}

function createStaticHandlers(permissions: string[], state: MockApiState): Record<string, StaticHandler> {
  return {
    'GET /theme/public-config': async route => {
      await fulfill(route, { code: '0000', msg: 'ok', data: { config: {}, effectiveConfig: {} } });
    },
    'GET /language/locales': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          records: [
            { locale: 'en-US', localeName: 'English', isDefault: true },
            { locale: 'zh-CN', localeName: '简体中文', isDefault: false }
          ]
        }
      });
    },
    'GET /language/messages': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          locale: 'en-US',
          version: 'test-v1',
          notModified: false,
          messages: {}
        }
      });
    },
    'POST /auth/login': async route => {
      const body = parseJsonBody(route);
      const loginKey = String(body.userName || body.email || '')
        .trim()
        .toLowerCase();
      const matchedUser =
        state.users.find(
          user => user.userName.trim().toLowerCase() === loginKey || user.email.trim().toLowerCase() === loginKey
        ) || state.users[0];

      state.currentUser = matchedUser;

      await fulfill(route, {
        code: '0000',
        msg: 'Login success',
        data: {
          token: 'test-access-token',
          refreshToken: 'test-refresh-token'
        }
      });
    },
    'GET /auth/getUserInfo': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: createAuthUserInfo(state.currentUser, permissions)
      });
    },
    'POST /auth/register': async route => {
      const body = parseJsonBody(route);
      const nextId = state.users.length + 1;
      const userName = String(body.name || `User${nextId}`);
      const email = String(body.email || `user${nextId}@example.com`);
      const newUser: MockUserRecord = {
        id: nextId,
        userName,
        email,
        roleCode: 'R_USER',
        roleName: 'User',
        status: '1',
        createTime: nowString(),
        updateTime: nowString()
      };

      state.users.push(newUser);
      state.currentUser = newUser;

      await fulfill(route, {
        code: '0000',
        msg: 'Register success',
        data: {
          token: `register-access-token-${nextId}`,
          refreshToken: `register-refresh-token-${nextId}`
        }
      });
    },
    'POST /auth/forgot-password': async route => {
      const body = parseJsonBody(route);
      const email = String(body.email || '')
        .trim()
        .toLowerCase();
      const user = state.users.find(item => item.email.trim().toLowerCase() === email);
      const token = user ? `reset-token-${user.id}` : undefined;

      if (user && token) {
        state.resetTokens[email] = token;
      }

      await fulfill(route, {
        code: '0000',
        msg: 'If the email exists, a reset link has been sent',
        data: token ? { resetToken: token } : {}
      });
    },
    'POST /auth/reset-password': async route => {
      const body = parseJsonBody(route);
      const email = String(body.email || '')
        .trim()
        .toLowerCase();
      const token = String(body.token || '').trim();
      const expectedToken = state.resetTokens[email];

      if (!expectedToken || expectedToken !== token) {
        await fulfill(
          route,
          {
            code: '1002',
            msg: 'Validation failed',
            data: {
              errors: {
                token: ['Reset token is invalid']
              }
            }
          },
          422
        );
        return;
      }

      state.resetTokens[email] = '';

      await fulfill(route, {
        code: '0000',
        msg: 'Password has been reset',
        data: {}
      });
    },
    'PUT /auth/preferred-locale': async route => {
      const body = parseJsonBody(route);
      const locale = String(body.locale || 'en-US');

      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          locale,
          preferredLocale: locale
        }
      });
    },
    'GET /role/all': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          records: [
            { roleId: 1, roleCode: 'R_SUPER', roleName: 'Super Admin' },
            { roleId: 2, roleCode: 'R_ADMIN', roleName: 'Admin' },
            { roleId: 3, roleCode: 'R_USER', roleName: 'User' }
          ]
        }
      });
    },
    'GET /system/ui/crud-schema/user': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          resource: 'user',
          permission: 'user.view',
          searchFields: [],
          columns: [],
          scrollX: 1300
        }
      });
    },
    'GET /user/list': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          current: 1,
          size: 10,
          total: state.users.length,
          records: state.users
        }
      });
    },
    'GET /audit/policy/list': async route => {
      await fulfill(route, {
        code: '0000',
        msg: 'ok',
        data: {
          records: [
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
              action: 'user.create',
              category: 'optional',
              mandatory: false,
              locked: false,
              lockReason: '',
              description: 'Create user',
              enabled: true,
              samplingRate: 1,
              retentionDays: 365,
              source: 'platform',
              defaultEnabled: true,
              defaultSamplingRate: 1,
              defaultRetentionDays: 365
            }
          ]
        }
      });
    }
  };
}

async function handleCreateUser(route: Route, state: MockApiState) {
  const body = parseJsonBody(route);
  const nextId = state.users.length + 1;
  const roleCode = String(body.roleCode || 'R_USER');

  state.users.push({
    id: nextId,
    userName: String(body.userName || `User${nextId}`),
    email: String(body.email || `user${nextId}@example.com`),
    roleCode,
    roleName: resolveRoleName(roleCode),
    status: String(body.status || '1') === '2' ? '2' : '1',
    createTime: nowString(),
    updateTime: nowString()
  });

  await fulfill(route, { code: '0000', msg: 'Add success', data: {} });
}

export async function registerMockApi(page: Page, options: MockApiOptions = {}): Promise<MockApiState> {
  const defaultUser: MockUserRecord = {
    id: 1,
    userName: 'Super',
    email: 'super@soybean.local',
    roleCode: 'R_SUPER',
    roleName: 'Super Admin',
    status: '1',
    createTime: nowString(),
    updateTime: nowString()
  };

  const state: MockApiState = {
    users: [defaultUser],
    currentUser: defaultUser,
    resetTokens: {}
  };

  const permissions = options.userPermissions || [
    'user.view',
    'user.manage',
    'role.view',
    'role.manage',
    'permission.view',
    'permission.manage',
    'audit.policy.view',
    'audit.policy.manage',
    'system.manage'
  ];
  const staticHandlers = createStaticHandlers(permissions, state);

  await page.route('**/proxy-default/**', async route => {
    const url = new URL(route.request().url());
    const method = route.request().method().toUpperCase();
    const path = normalizePath(url.pathname);
    const key = `${method} ${path}`;

    if (key === 'POST /user') {
      await handleCreateUser(route, state);
      return;
    }

    const handler = staticHandlers[key];
    if (handler) {
      await handler(route, state);
      return;
    }

    await fulfill(route, { code: '0000', msg: 'ok', data: {} });
  });

  return state;
}
