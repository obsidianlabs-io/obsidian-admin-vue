import type { CustomAxiosRequestConfig } from '@sa/axios';
import {
  deleteAuthSessionsBySessionId,
  getAuthError,
  getAuthGetUserInfo,
  getAuthMenus,
  getAuthProfile,
  getAuthSessions,
  getAuthTimezones,
  postAuth2FaDisable,
  postAuth2FaEnable,
  postAuth2FaSetup,
  postAuthForgotPassword,
  postAuthLogin,
  postAuthLogout,
  postAuthRefreshToken,
  postAuthRegister,
  postAuthResetPassword,
  putAuthPreferences,
  putAuthPreferredLocale,
  putAuthProfile,
  putAuthSessionsBySessionIdAlias
} from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Login
 *
 * @param payload Login payload
 */
export function fetchLogin(
  payload: {
    userName: string;
    password: string;
    rememberMe: boolean;
    otpCode?: string;
    locale?: App.I18n.LangType | null;
  },
  config?: CustomAxiosRequestConfig
) {
  const { userName, password, rememberMe, otpCode, locale } = payload;

  return callGenerated<Api.Auth.LoginToken>(() =>
    postAuthLogin(
      buildGeneratedOptions(
        {
          body: {
            userName,
            password,
            rememberMe,
            otpCode,
            locale: locale || undefined
          }
        },
        config
      )
    )
  );
}

/**
 * Register
 *
 * @param payload Register payload
 */
export function fetchRegister(payload: Api.Auth.RegisterPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<Api.Auth.LoginToken>(() =>
    postAuthRegister(
      buildGeneratedOptions(
        {
          body: payload
        },
        config
      )
    )
  );
}

/**
 * Send forgot-password request
 *
 * @param payload Forgot-password payload
 */
export function fetchForgotPassword(payload: Api.Auth.ForgotPasswordPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<Api.Auth.ForgotPasswordResult>(() =>
    postAuthForgotPassword(
      buildGeneratedOptions(
        {
          body: payload
        },
        config
      )
    )
  );
}

/**
 * Reset password
 *
 * @param payload Reset-password payload
 */
export function fetchResetPassword(payload: Api.Auth.ResetPasswordPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<Record<string, never>>(() =>
    postAuthResetPassword(
      buildGeneratedOptions(
        {
          body: payload
        },
        config
      )
    )
  );
}

/** Get user info */
export function fetchGetUserInfo() {
  return callGenerated<Api.Auth.UserInfo>(() => getAuthGetUserInfo());
}

/** Get backend-driven menus and route rules */
export function fetchGetUserMenus() {
  return callGenerated<Pick<Api.Auth.UserInfo, 'menuScope' | 'menus' | 'routeRules'>>(() => getAuthMenus());
}

/** Get current user profile */
export function fetchGetUserProfile() {
  return callGenerated<Api.Auth.UserProfile>(() => getAuthProfile());
}

/**
 * Update current user profile
 *
 * @param data Payload
 */
export function fetchUpdateUserProfile(data: Api.Auth.UpdateProfilePayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<Api.Auth.UserProfile>(() =>
    putAuthProfile(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/**
 * Update current user locale
 *
 * @param locale Locale
 */
export function fetchUpdateLocale(locale: App.I18n.LangType) {
  return callGenerated<{ locale: App.I18n.LangType; preferredLocale?: App.I18n.LangType }>(() =>
    putAuthPreferredLocale(
      buildGeneratedOptions({
        body: {
          locale
        }
      })
    )
  );
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
  return callGenerated<{ themeSchema?: UnionKey.ThemeScheme | null; timezone?: string }>(() =>
    putAuthPreferences(
      buildGeneratedOptions({
        body: data
      })
    )
  );
}

/** Get timezone options for profile preferences */
export function fetchGetTimezoneOptions() {
  return callGenerated<{
    defaultTimezone: string;
    records: Api.Auth.TimezoneOption[];
  }>(() => getAuthTimezones());
}

/** Get current user auth sessions */
export function fetchGetAuthSessions() {
  return callGenerated<Api.Auth.AuthSessionList>(() => getAuthSessions());
}

/** Revoke an auth session by session id */
export function fetchRevokeAuthSession(sessionId: string) {
  return callGenerated<Api.Auth.RevokeAuthSessionResult>(() =>
    deleteAuthSessionsBySessionId(
      buildGeneratedOptions({
        path: {
          sessionId
        }
      })
    )
  );
}

/** Logout current session */
export function fetchLogout(refreshToken?: string) {
  return callGenerated<{ userId: string }>(() =>
    postAuthLogout(
      buildGeneratedOptions({
        body: refreshToken
          ? {
              refreshToken
            }
          : undefined
      })
    )
  );
}

/** Update an auth session alias */
export function fetchUpdateAuthSessionAlias(sessionId: string, data: Api.Auth.UpdateAuthSessionAliasPayload) {
  return callGenerated<Api.Auth.UpdateAuthSessionAliasResult>(() =>
    putAuthSessionsBySessionIdAlias(
      buildGeneratedOptions({
        path: {
          sessionId
        },
        body: data
      })
    )
  );
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return callGenerated<Api.Auth.LoginToken>(() =>
    postAuthRefreshToken(
      buildGeneratedOptions({
        body: {
          refreshToken
        }
      })
    )
  );
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return callGenerated<unknown>(() =>
    getAuthError(
      buildGeneratedOptions({
        query: { code, msg }
      })
    )
  );
}

/**
 * Setup Two-Factor Authentication
 */
export function fetchSetupTwoFactor() {
  return callGenerated<{ secret: string; otpauthUrl: string; enabled: boolean }>(() => postAuth2FaSetup());
}

/**
 * Enable Two-Factor Authentication
 *
 * @param otpCode OTP Code
 */
export function fetchEnableTwoFactor(otpCode: string) {
  return callGenerated<{ enabled: boolean }>(() =>
    postAuth2FaEnable(
      buildGeneratedOptions({
        body: { otpCode }
      })
    )
  );
}

/**
 * Disable Two-Factor Authentication
 *
 * @param otpCode OTP Code
 */
export function fetchDisableTwoFactor(otpCode: string) {
  return callGenerated<{ enabled: boolean }>(() =>
    postAuth2FaDisable(
      buildGeneratedOptions({
        body: { otpCode }
      })
    )
  );
}
