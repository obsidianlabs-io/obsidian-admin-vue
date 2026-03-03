import { useAuthStore } from '@/store/modules/auth';
import { getCurrentTenantId, getRefreshToken, getToken, updateAuthTokens } from '@/store/modules/auth/shared';
import { resolvePreferredLocale } from '@/locales/default-locale';
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
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
