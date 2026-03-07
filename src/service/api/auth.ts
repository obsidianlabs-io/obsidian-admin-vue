import type { CustomAxiosRequestConfig } from '@sa/axios';
import { request } from '../request';

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
}): ReturnType<typeof request<Api.Auth.LoginToken>> {
  const { userName, password, rememberMe, otpCode, locale } = payload;

  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password,
      rememberMe,
      otpCode,
      locale: locale || undefined
    }
  });
}

/** Get user info */
export function fetchGetUserInfo(): ReturnType<typeof request<Api.Auth.UserInfo>> {
  return request<Api.Auth.UserInfo>({
    url: '/auth/getUserInfo'
  });
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
export function fetchUpdateUserProfile(data: Api.Auth.UpdateProfilePayload, config?: CustomAxiosRequestConfig) {
  return request<Api.Auth.UserProfile>({
    url: '/auth/profile',
    method: 'put',
    data,
    ...config
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
  return request<{ secret: string; otpauthUrl: string; enabled: boolean }>({
    url: '/auth/2fa/setup',
    method: 'post'
  });
}

/**
 * Enable Two-Factor Authentication
 *
 * @param otpCode OTP Code
 */
export function fetchEnableTwoFactor(otpCode: string) {
  return request<{ enabled: boolean }>({
    url: '/auth/2fa/enable',
    method: 'post',
    data: { otpCode }
  });
}

/**
 * Disable Two-Factor Authentication
 *
 * @param otpCode OTP Code
 */
export function fetchDisableTwoFactor(otpCode: string) {
  return request<{ enabled: boolean }>({
    url: '/auth/2fa/disable',
    method: 'post',
    data: { otpCode }
  });
}
