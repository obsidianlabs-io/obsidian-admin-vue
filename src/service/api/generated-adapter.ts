import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE } from '@sa/axios';
import { getCurrentTenantId } from '@/store/modules/auth/shared';
import { getServiceBaseURL } from '@/utils/service';
import { resolvePreferredLocale } from '@/locales/default-locale';
import { request } from '../request';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from '../request/shared';
import { client as generatedClient } from './generated/client.gen';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);
const apifoxToken = import.meta.env.DEV ? String(import.meta.env.VITE_APIFOX_TOKEN || '').trim() : '';
const defaultHeaders = apifoxToken ? { apifoxToken } : {};

const successCode = String(import.meta.env.VITE_SERVICE_SUCCESS_CODE || '0000');
const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];

generatedClient.setConfig({
  baseURL,
  headers: defaultHeaders,
  requestValidator: async rawOptions => {
    const options = rawOptions as { headers?: Record<string, unknown> };
    const headers = { ...(options.headers as Record<string, unknown> | undefined) };

    const Authorization = getAuthorization();
    Object.assign(headers, { Authorization });

    const lang = resolvePreferredLocale();
    Object.assign(headers, {
      'Accept-Language': lang,
      'X-Locale': lang
    });

    const tenantId = getCurrentTenantId();
    if (tenantId) {
      Object.assign(headers, { 'X-Tenant-Id': tenantId });
    }

    options.headers = headers;
  }
});

function createBackendError(
  responseCode: string,
  payload: App.Service.Response<unknown>,
  response: AxiosResponse
): { code: string; message: string; response: AxiosResponse; isBackendError: true } {
  return {
    code: responseCode,
    message: payload.msg || 'Request failed',
    response,
    isBackendError: true
  };
}

interface GeneratedCallOptions {
  silentCodes?: string[];
  retryOnExpired?: boolean;
}

// eslint-disable-next-line complexity
export async function callGenerated<T>(
  call: () => Promise<any>,
  options: GeneratedCallOptions = {}
): Promise<{
  data: T | null;
  error: any;
  response: AxiosResponse | undefined;
}> {
  const { silentCodes = [], retryOnExpired = true } = options;
  const mutedCodes = new Set([...modalLogoutCodes, ...silentCodes]);

  const result = await call();

  if (result?.error !== undefined && result?.data === undefined) {
    const backendCode = String(result?.response?.data?.code ?? '');

    if (retryOnExpired && expiredTokenCodes.includes(backendCode)) {
      const refreshed = await handleExpiredRequest(request.state);
      if (refreshed) {
        return callGenerated<T>(call, { ...options, retryOnExpired: false });
      }
    }

    if (!mutedCodes.has(backendCode)) {
      const message = result?.response?.data?.msg || result?.message || 'Request failed';
      showErrorMsg(request.state, message);
    }

    return {
      data: null,
      error: result,
      response: result?.response
    };
  }

  const response = result as AxiosResponse<App.Service.Response<T> | T>;
  const payload = response?.data as App.Service.Response<T> | undefined;

  if (!payload || typeof payload !== 'object' || !('code' in payload)) {
    return {
      data: response?.data as T,
      error: null,
      response
    };
  }

  const responseCode = String(payload.code);
  if (responseCode === successCode) {
    return {
      data: payload.data as T,
      error: null,
      response
    };
  }

  if (retryOnExpired && expiredTokenCodes.includes(responseCode)) {
    const refreshed = await handleExpiredRequest(request.state);
    if (refreshed) {
      return callGenerated<T>(call, { ...options, retryOnExpired: false });
    }
  }

  const backendError = createBackendError(responseCode, payload, response);
  if (!mutedCodes.has(responseCode)) {
    showErrorMsg(request.state, payload.msg || 'Request failed');
  }

  return {
    data: null,
    error: {
      ...backendError,
      code: backendError.code || BACKEND_ERROR_CODE
    },
    response
  };
}
