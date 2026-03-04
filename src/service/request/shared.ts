import { useAuthStore } from '@/store/modules/auth';
import { getCurrentTenantId, getRefreshToken, getToken, updateAuthTokens } from '@/store/modules/auth/shared';
import { resolvePreferredLocale } from '@/locales/default-locale';
import { $t } from '@/locales';
import { fetchRefreshToken } from '../api';
import type { RequestInstanceState } from './type';
import { buildRequestContextHeaders, resolveServiceCodeConfig } from './context';

const runtimeEnv = ((import.meta as ImportMeta & { env?: Partial<Env.ImportMeta> }).env ||
  {}) as Partial<Env.ImportMeta>;
const serviceCodeConfig = resolveServiceCodeConfig(runtimeEnv);

export const serviceSuccessCode = serviceCodeConfig.successCode;
export const logoutCodes = serviceCodeConfig.logoutCodes;
export const modalLogoutCodes = serviceCodeConfig.modalLogoutCodes;
export const expiredTokenCodes = serviceCodeConfig.expiredTokenCodes;
const tenantInactiveMessage = 'Tenant is inactive';
const userInactiveMessage = 'User is inactive';

const backendMessageI18nMap: Partial<Record<string, App.I18n.I18nKey>> = {
  'User is inactive': 'page.login.common.userInactive',
  'Tenant is inactive': 'page.login.common.tenantInactive',
  'Organization is inactive': 'page.login.common.organizationInactive',
  'Team is inactive': 'page.login.common.teamInactive',
  'Email is not verified': 'page.login.common.emailNotVerified',
  'Username or password is incorrect': 'page.login.common.invalidCredentials',
  'Two-factor code required': 'page.login.common.twoFactorRequired',
  'Two-factor code is invalid': 'page.login.common.twoFactorInvalid'
};

function localizeBackendMessage(message: string): string {
  const normalized = normalizeMessage(message);
  const i18nKey = backendMessageI18nMap[normalized];

  return i18nKey ? $t(i18nKey) : message;
}

function normalizeMessage(message: unknown): string {
  return String(message || '').trim();
}

function parseErrorPayload(error: unknown): { code: string; message: string } {
  if (!error || typeof error !== 'object') {
    return { code: '', message: '' };
  }

  const response = (error as { response?: { data?: { code?: unknown; msg?: unknown } } }).response;

  return {
    code: String(response?.data?.code ?? ''),
    message: normalizeMessage(response?.data?.msg ?? '')
  };
}

export function isTenantInactivePayload(code: unknown, message: unknown): boolean {
  const normalizedMessage = normalizeMessage(message);
  const normalizedCode = String(code ?? '');

  return normalizedMessage === tenantInactiveMessage && (normalizedCode === '' || normalizedCode === '8888');
}

export function isUserInactivePayload(code: unknown, message: unknown): boolean {
  const normalizedMessage = normalizeMessage(message);
  const normalizedCode = String(code ?? '');

  return normalizedMessage === userInactiveMessage && (normalizedCode === '' || normalizedCode === '8888');
}

export function isSessionEndingCode(code: unknown): boolean {
  const normalizedCode = String(code ?? '');

  return (
    logoutCodes.includes(normalizedCode) ||
    modalLogoutCodes.includes(normalizedCode) ||
    expiredTokenCodes.includes(normalizedCode)
  );
}

export function shouldSkipGlobalErrorToast(error: unknown): boolean {
  const payload = parseErrorPayload(error);

  return isSessionEndingCode(payload.code) || isTenantInactivePayload(payload.code, payload.message);
}

export function getAuthorization() {
  const token = getToken();
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

export function createRequestContextHeaders(initialHeaders: Record<string, unknown> = {}) {
  return buildRequestContextHeaders(
    {
      authorization: getAuthorization(),
      locale: resolvePreferredLocale(),
      tenantId: getCurrentTenantId()
    },
    initialHeaders
  );
}

/** refresh token */
async function handleRefreshToken() {
  const { resetStore } = useAuthStore();

  const rToken = getRefreshToken();
  const { error, data } = await fetchRefreshToken(rToken);
  if (!error) {
    updateAuthTokens(data);
    return true;
  }

  resetStore();

  return false;
}

export async function handleExpiredRequest(state: RequestInstanceState) {
  if (!state.refreshTokenPromise) {
    state.refreshTokenPromise = handleRefreshToken();
  }

  const success = await state.refreshTokenPromise;

  setTimeout(() => {
    state.refreshTokenPromise = null;
  }, 1000);

  return success;
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  const localizedMessage = localizeBackendMessage(message);

  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(localizedMessage);

  if (!isExist) {
    state.errMsgStack.push(localizedMessage);

    window.$message?.error(localizedMessage, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== localizedMessage);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
