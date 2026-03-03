import { request } from '../request';
import {
  getAuthGetUserInfo,
  postAuth2FaDisable,
  postAuth2FaEnable,
  postAuth2FaSetup,
  postAuthLogin
} from './generated';
import type { ApiRequestResult } from './shared';
import { callGeneratedApi } from './shared';

/**
 * Login
 *
 * @param payload Login payload
 */
export function fetchLogin(payload: {
  userName: string;
  password: string;
  rememberMe: boolean;
  otpCode?: string;
  locale?: App.I18n.LangType | null;
}): ApiRequestResult<Api.Auth.LoginToken> {
  const { userName, password, rememberMe, otpCode, locale } = payload;

  return callGeneratedApi<Api.Auth.LoginToken>(
    () =>
      postAuthLogin({
        body: {
          userName,
          password,
          rememberMe,
          otpCode,
          locale: locale || undefined
        }
      } as Parameters<typeof postAuthLogin>[0]),
    {
      silentCodes: ['4020']
    }
  );
}

/** Get user info */
export function fetchGetUserInfo(): ApiRequestResult<Api.Auth.UserInfo> {
  return callGeneratedApi<Api.Auth.UserInfo>(() => getAuthGetUserInfo());
}

/** Get backend-driven menus and route rules */
export function fetchGetUserMenus() {
  return request<Pick<Api.Auth.UserInfo, 'menuScope' | 'menus' | 'routeRules'>>({
    url: '/auth/menus'
  });
}

/** Get current user profile */
export function fetchGetUserProfile() {
  return request<Api.Auth.UserProfile>({
    url: '/auth/profile'
  });
}

/**
 * Update current user profile
 *
 * @param data Payload
 */
export function fetchUpdateUserProfile(data: Api.Auth.UpdateProfilePayload) {
  return request<Api.Auth.UserProfile>({
    url: '/auth/profile',
    method: 'put',
    data
  });
}

/**
 * Update current user locale
 *
 * @param locale Locale
 */
export function fetchUpdateLocale(locale: App.I18n.LangType) {
  return request<{ locale: App.I18n.LangType; preferredLocale?: App.I18n.LangType }>({
    url: '/auth/preferred-locale',
    method: 'put',
    data: {
      locale
    }
  });
}

/** @deprecated Use `fetchUpdateLocale` */
export function fetchUpdatePreferredLocale(preferredLocale: App.I18n.LangType) {
  return fetchUpdateLocale(preferredLocale);
}

/**
 * Update current user preferences
 *
 * @param data Preferences payload
 */
export function fetchUpdateUserPreferences(data: Api.Auth.UpdatePreferencesPayload) {
  return request<{ themeSchema?: UnionKey.ThemeScheme | null; timezone?: string }>({
    url: '/auth/preferences',
    method: 'put',
    data
  });
}

/** Get timezone options for profile preferences */
export function fetchGetTimezoneOptions() {
  return request<{
    defaultTimezone: string;
    records: Api.Auth.TimezoneOption[];
  }>({
    url: '/auth/timezones'
  });
}

/** Get current user auth sessions */
export function fetchGetAuthSessions() {
  return request<Api.Auth.AuthSessionList>({
    url: '/auth/sessions'
  });
}

/** Revoke an auth session by session id */
export function fetchRevokeAuthSession(sessionId: string) {
  return request<Api.Auth.RevokeAuthSessionResult>({
    url: `/auth/sessions/${encodeURIComponent(sessionId)}`,
    method: 'delete'
  });
}

/** Logout current session */
export function fetchLogout(refreshToken?: string) {
  return request<{ userId: string }>({
    url: '/auth/logout',
    method: 'post',
    data: refreshToken
      ? {
          refreshToken
        }
      : undefined
  });
}

/** Update an auth session alias */
export function fetchUpdateAuthSessionAlias(sessionId: string, data: Api.Auth.UpdateAuthSessionAliasPayload) {
  return request<Api.Auth.UpdateAuthSessionAliasResult>({
    url: `/auth/sessions/${encodeURIComponent(sessionId)}/alias`,
    method: 'put',
    data
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request<unknown>({
    url: '/auth/error',
    params: { code, msg }
  });
}

/**
 * Setup Two-Factor Authentication
 */
export function fetchSetupTwoFactor() {
  return callGeneratedApi<{ secret: string; otpauthUrl: string; enabled: boolean }>(() => postAuth2FaSetup());
}

/**
 * Enable Two-Factor Authentication
 *
 * @param otpCode OTP Code
 */
export function fetchEnableTwoFactor(otpCode: string) {
  return callGeneratedApi<{ enabled: boolean }>(() =>
    postAuth2FaEnable({
      body: { otpCode }
    } as unknown as Parameters<typeof postAuth2FaEnable>[0])
  );
}

/**
 * Disable Two-Factor Authentication
 *
 * @param otpCode OTP Code
 */
export function fetchDisableTwoFactor(otpCode: string) {
  return callGeneratedApi<{ enabled: boolean }>(() =>
    postAuth2FaDisable({
      body: { otpCode }
    } as unknown as Parameters<typeof postAuth2FaDisable>[0])
  );
}
