import { getCurrentTenantId, getRefreshToken, getToken, updateAuthTokens } from '@/store/modules/auth/shared';
import { getNaiveMessage } from '@/utils/naive-ui';
import { resolvePreferredLocale } from '@/locales/default-locale';
import { $t } from '@/locales';
import { resolveValidationErrors } from './validation';
import type { ValidationErrorMap } from './validation';
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
  'Role is inactive': 'page.login.common.roleInactive',
  'Tenant is inactive': 'page.login.common.tenantInactive',
  'Organization is inactive': 'page.login.common.organizationInactive',
  'Team is inactive': 'page.login.common.teamInactive',
  'Organization has assigned teams': 'common.organizationHasAssignedTeams',
  'Organization has assigned users': 'common.organizationHasAssignedUsers',
  'Team has assigned users': 'common.teamHasAssignedUsers',
  'Team has assigned users and cannot move organization': 'common.teamHasAssignedUsersCannotMoveOrganization',
  'Role has assigned users': 'common.roleHasAssignedUsers',
  'Permission is assigned to roles': 'common.permissionAssignedToRoles',
  'Delete conflict': 'common.deleteConflict',
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

function resolveTransportErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return $t('request.serviceUnavailable');
  }

  const axiosLikeError = error as {
    code?: unknown;
    message?: unknown;
    response?: {
      status?: unknown;
    };
  };

  const status = Number(axiosLikeError.response?.status ?? 0);
  const code = String(axiosLikeError.code ?? '');
  const message = normalizeMessage(axiosLikeError.message);

  if (code === 'ECONNABORTED' || /timeout/i.test(message)) {
    return $t('request.timeout');
  }

  if (code === 'ERR_NETWORK' || /network error/i.test(message)) {
    return $t('request.networkError');
  }

  if ([500, 502, 503, 504].includes(status)) {
    return $t('request.serviceUnavailable');
  }

  return message || $t('request.serviceUnavailable');
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

export type RequestErrorKind =
  | 'transport'
  | 'business'
  | 'validation'
  | 'session_ending'
  | 'modal_logout'
  | 'inactive_boundary'
  | 'two_factor_required';

export interface RequestErrorStrategy {
  code: string;
  backendMessage: string;
  displayMessage: string;
  fieldErrors: ValidationErrorMap;
  hasStructuredPayload: boolean;
  kind: RequestErrorKind;
  isValidation: boolean;
  isSessionEnding: boolean;
  isModalLogout: boolean;
  isInactiveBoundary: boolean;
  isTwoFactorRequired: boolean;
  shouldHandleValidationLocally: boolean;
  shouldSkipGlobalToast: boolean;
  shouldShowGlobalToast: boolean;
}

export function resolveRequestErrorStrategy(
  error: unknown,
  options: {
    handleValidationErrorLocally?: boolean;
    fallbackMessage?: string;
  } = {}
): RequestErrorStrategy {
  const payload = parseErrorPayload(error);
  const fieldErrors = resolveValidationErrors(error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const handleValidationErrorLocally = options.handleValidationErrorLocally === true;
  const isInactiveBoundary =
    isTenantInactivePayload(payload.code, payload.message) || isUserInactivePayload(payload.code, payload.message);
  const isTwoFactorRequired = payload.code === '4020';
  const isModalLogout = modalLogoutCodes.includes(payload.code);
  const isSessionEnding = isSessionEndingCode(payload.code);
  const shouldHandleValidationLocally = handleValidationErrorLocally && hasFieldErrors;
  const fallbackMessage = normalizeMessage(options.fallbackMessage);

  let kind: RequestErrorKind = 'transport';
  if (isInactiveBoundary) {
    kind = 'inactive_boundary';
  } else if (isTwoFactorRequired) {
    kind = 'two_factor_required';
  } else if (isModalLogout) {
    kind = 'modal_logout';
  } else if (isSessionEnding) {
    kind = 'session_ending';
  } else if (hasFieldErrors) {
    kind = 'validation';
  } else if (payload.code !== '' || payload.message !== '') {
    kind = 'business';
  }

  let displayMessage = payload.message;
  if (displayMessage === '') {
    if (fallbackMessage !== '' && !/^Request failed with status code\s+\d+$/i.test(fallbackMessage)) {
      displayMessage = fallbackMessage;
    } else {
      displayMessage = resolveTransportErrorMessage(error);
    }
  }

  const shouldSkipGlobalToast = isSessionEnding || isInactiveBoundary;
  const shouldShowGlobalToast =
    !shouldHandleValidationLocally && !shouldSkipGlobalToast && !isModalLogout && !isTwoFactorRequired;

  return {
    code: payload.code,
    backendMessage: payload.message,
    displayMessage,
    fieldErrors,
    hasStructuredPayload: payload.code !== '' || payload.message !== '' || hasFieldErrors,
    kind,
    isValidation: hasFieldErrors,
    isSessionEnding,
    isModalLogout,
    isInactiveBoundary,
    isTwoFactorRequired,
    shouldHandleValidationLocally,
    shouldSkipGlobalToast,
    shouldShowGlobalToast
  };
}

export function isValidationErrorPayload(error: unknown): boolean {
  return resolveRequestErrorStrategy(error).isValidation;
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
  return resolveRequestErrorStrategy(error).shouldSkipGlobalToast;
}

export function resolveRequestErrorMessage(error: unknown, fallbackMessage: string): string {
  return resolveRequestErrorStrategy(error, { fallbackMessage }).displayMessage;
}

export function shouldApplyServerValidation(error: unknown): boolean {
  return resolveRequestErrorStrategy(error, { handleValidationErrorLocally: true }).shouldHandleValidationLocally;
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
  const [{ useAuthStore }, { fetchRefreshToken }] = await Promise.all([
    import('@/store/modules/auth'),
    import('@/service/api/auth')
  ]);
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

    getNaiveMessage()?.error(localizedMessage, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== localizedMessage);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
