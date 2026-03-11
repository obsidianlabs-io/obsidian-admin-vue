import type { DemoBackend } from './backend';
import type { DemoBackendRequest, DemoBackendResponse } from './backend-core';
import {
  addMinutes,
  fail,
  invalidCredentialsCode,
  invalidTwoFactorCode,
  nowString,
  ok,
  unauthorizedCode,
  validation
} from './backend-core';

export function handleAuthRequest(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.method.toUpperCase()) {
    case 'GET':
      return handleAuthGet(backend, request);
    case 'POST':
      return handleAuthPost(backend, request);
    case 'PUT':
      return handleAuthPut(backend, request);
    case 'DELETE':
      return handleAuthDelete(backend, request);
    default:
      return null;
  }
}

function handleAuthGet(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/auth/getUserInfo':
    case '/auth/me':
      return ok(backend.userInfo(request.headers));
    case '/auth/menus':
      return ok(backend.userMenus(request.headers));
    case '/auth/profile':
      return ok(backend.userProfile(request.headers));
    case '/auth/timezones':
      return ok({ defaultTimezone: 'UTC', records: backend.defaultTimezoneOptions });
    case '/auth/sessions':
      return ok(userSessions(backend, request.headers));
    default:
      if (request.path.startsWith('/auth/error')) {
        return ok({ errors: [] });
      }

      return null;
  }
}

function handleAuthPost(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/auth/login':
      return login(backend, request.body);
    case '/auth/register':
      return register(backend, request.body);
    case '/auth/logout':
      return ok({ userId: backend.requireCurrentUser(request.headers).id.toString() }, 'Logout success');
    case '/auth/refreshToken':
      return refreshToken(backend, request.body);
    case '/auth/forgot-password':
      return ok({ resetToken: 'demo-reset-token' }, 'If the email exists, a reset link has been sent');
    case '/auth/reset-password':
      return resetPassword(request.body);
    case '/auth/2fa/setup':
      return ok({
        secret: 'DEMOSECRET123',
        otpauthUrl: 'otpauth://totp/Obsidian:demo?secret=DEMOSECRET123',
        enabled: backend.requireCurrentUser(request.headers).twoFactorEnabled
      });
    case '/auth/2fa/enable':
      return toggleTwoFactor({ backend, headers: request.headers, body: request.body, enabled: true });
    case '/auth/2fa/disable':
      return toggleTwoFactor({ backend, headers: request.headers, body: request.body, enabled: false });
    default:
      return null;
  }
}

function handleAuthPut(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/auth/profile':
      return updateProfile(backend, request.headers, request.body);
    case '/auth/preferences':
      return updatePreferences(backend, request.headers, request.body);
    case '/auth/preferred-locale':
      return updatePreferredLocale(backend, request.headers, request.body);
    case '/auth/sessions/:sessionId/alias':
      return updateSessionAlias({
        backend,
        path: request.path,
        headers: request.headers,
        body: request.body
      });
    default:
      return null;
  }
}

function handleAuthDelete(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  if (request.path === '/auth/sessions/:sessionId') {
    return revokeSession(backend, request.path, request.headers);
  }

  return null;
}

function updateProfile(backend: DemoBackend, headers: Record<string, string>, body: Record<string, unknown>) {
  const user = backend.requireCurrentUser(headers);
  const nextUserName = String(body.userName || user.userName).trim();
  const nextEmail = String(body.email || user.email)
    .trim()
    .toLowerCase();
  const errors: Record<string, string[]> = {};

  if (
    backend.state.users.some(item => item.id !== user.id && item.userName.toLowerCase() === nextUserName.toLowerCase())
  ) {
    errors.userName = ['User name has already been taken'];
  }

  if (backend.state.users.some(item => item.id !== user.id && item.email.toLowerCase() === nextEmail)) {
    errors.email = ['Email has already been taken'];
  }

  if (Object.keys(errors).length) {
    return validation(errors);
  }

  user.userName = nextUserName;
  user.email = nextEmail;
  user.timezone = String(body.timezone || user.timezone).trim() || user.timezone;
  user.updateTime = nowString();
  return ok(backend.userProfile(headers), 'Profile updated');
}

function updatePreferences(backend: DemoBackend, headers: Record<string, string>, body: Record<string, unknown>) {
  const user = backend.requireCurrentUser(headers);

  if (typeof body.themeSchema === 'string') {
    user.themeSchema = body.themeSchema as UnionKey.ThemeScheme;
  }

  if (typeof body.timezone === 'string' && body.timezone.trim()) {
    user.timezone = body.timezone.trim();
  }

  user.updateTime = nowString();
  return ok({ themeSchema: user.themeSchema, timezone: user.timezone }, 'Preferences updated');
}

function updatePreferredLocale(backend: DemoBackend, headers: Record<string, string>, body: Record<string, unknown>) {
  const user = backend.requireCurrentUser(headers);
  const locale = String(body.locale || 'en-US') as App.I18n.LangType;
  user.locale = locale;
  user.updateTime = nowString();
  return ok({ locale, preferredLocale: locale }, 'Locale updated');
}

function userSessions(backend: DemoBackend, headers: Record<string, string>): Api.Auth.AuthSessionList {
  const user = backend.requireCurrentUser(headers);

  return {
    singleDeviceLogin: false,
    records: backend.state.sessions[user.id] || []
  };
}

function revokeSession(backend: DemoBackend, path: string, headers: Record<string, string>) {
  const user = backend.requireCurrentUser(headers);
  const sessionId = backend.parseSessionId(path);
  backend.state.sessions[user.id] = (backend.state.sessions[user.id] || []).filter(
    item => item.sessionId !== sessionId
  );
  return ok({ sessionId, deletedTokenCount: 2, revokedCurrentSession: false }, 'Session revoked');
}

function updateSessionAlias(params: {
  backend: DemoBackend;
  path: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}) {
  const { backend, path, headers, body } = params;
  const user = backend.requireCurrentUser(headers);
  const sessionId = backend.parseSessionId(path);
  const session = (backend.state.sessions[user.id] || []).find(item => item.sessionId === sessionId);

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

function toggleTwoFactor(params: {
  backend: DemoBackend;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  enabled: boolean;
}) {
  const { backend, headers, body, enabled } = params;
  const user = backend.requireCurrentUser(headers);
  const otpCode = String(body.otpCode || body.code || '').trim();

  if (otpCode !== '123456') {
    return fail(invalidTwoFactorCode, 'Two-factor code is invalid', 422);
  }

  user.twoFactorEnabled = enabled;
  user.updateTime = nowString();
  return ok({ enabled }, enabled ? 'Two-factor enabled' : 'Two-factor disabled');
}

function login(backend: DemoBackend, body: Record<string, unknown>) {
  const loginKey = String(body.userName || body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');
  const otpCode = String(body.otpCode || '').trim();
  const user = backend.state.users.find(
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

  backend.appendAuditLog({
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

  return ok(backend.tokenPair(user.id), 'Login success');
}

function refreshToken(backend: DemoBackend, body: Record<string, unknown>) {
  const refreshTokenValue = String(body.refreshToken || '').trim();
  const userId = backend.userIdFromToken(refreshTokenValue);

  if (!userId) {
    return fail(unauthorizedCode, 'Session expired', 401);
  }

  return ok(backend.tokenPair(userId), 'Token refreshed');
}

function register(backend: DemoBackend, body: Record<string, unknown>) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const errors: Record<string, string[]> = {};

  if (backend.state.users.some(item => item.userName.toLowerCase() === name.toLowerCase())) {
    errors.name = ['User name has already been taken'];
  }

  if (backend.state.users.some(item => item.email.toLowerCase() === email)) {
    errors.email = ['Email has already been taken'];
  }

  if (Object.keys(errors).length) {
    return validation(errors);
  }

  const userId = backend.state.users.length + 1;
  const createdAt = nowString();

  backend.state.users.push({
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

  backend.state.sessions[userId] = [
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

  return ok(backend.tokenPair(userId), 'Register success');
}

function resetPassword(body: Record<string, unknown>) {
  const token = String(body.token || '').trim();

  if (token !== 'demo-reset-token') {
    return validation({ token: ['Reset token is invalid'] });
  }

  return ok({}, 'Password has been reset');
}
