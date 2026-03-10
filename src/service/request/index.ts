import type { AxiosAdapter, AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { getToken } from '@/store/modules/auth/shared';
import { getServiceBaseURL } from '@/utils/service';
import { isDemoRuntime } from '@/utils/runtime';
import { $t } from '@/locales';
import {
  createRequestContextHeaders,
  expiredTokenCodes,
  getAuthorization,
  handleExpiredRequest,
  isSessionEndingCode,
  isTenantInactivePayload,
  isUserInactivePayload,
  isValidationErrorPayload,
  logoutCodes,
  modalLogoutCodes,
  serviceSuccessCode,
  shouldSkipGlobalErrorToast,
  showErrorMsg
} from './shared';
import type { RequestInstanceState } from './type';

const runtimeEnv = ((import.meta as ImportMeta & { env?: Partial<Env.ImportMeta> }).env ||
  {}) as Partial<Env.ImportMeta>;
const demoRuntime = isDemoRuntime(runtimeEnv);
let demoAxiosAdapterPromise: Promise<AxiosAdapter> | null = null;

async function resolveDemoAxiosAdapter(): Promise<AxiosAdapter> {
  if (!demoAxiosAdapterPromise) {
    demoAxiosAdapterPromise = import('@/demo/backend').then(({ createDemoAxiosAdapter }) => createDemoAxiosAdapter());
  }

  return demoAxiosAdapterPromise;
}

const demoAxiosAdapter: AxiosAdapter | undefined = demoRuntime
  ? async config => {
      const adapter = await resolveDemoAxiosAdapter();
      return adapter(config);
    }
  : undefined;
const isHttpProxy = runtimeEnv.DEV === true && runtimeEnv.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(runtimeEnv as Env.ImportMeta, isHttpProxy);
const apifoxToken = runtimeEnv.DEV ? String(runtimeEnv.VITE_APIFOX_TOKEN || '').trim() : '';
const defaultHeaders = apifoxToken ? { apifoxToken } : {};
let passiveLogoutInProgress = false;

async function resolveAuthStore() {
  const { useAuthStore } = await import('@/store/modules/auth');

  return useAuthStore();
}

export const request = createFlatRequest(
  {
    baseURL,
    headers: defaultHeaders,
    adapter: demoAxiosAdapter
  },
  {
    defaultState: {
      errMsgStack: [],
      refreshTokenPromise: null
    } as RequestInstanceState,
    transform(response: AxiosResponse<App.Service.Response<any>>) {
      return response.data.data;
    },
    async onRequest(config) {
      const headers = createRequestContextHeaders(config.headers as Record<string, unknown>);
      Object.assign(config.headers, headers);
      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "0000"(default), it means the request is success
      // to change this logic by yourself, you can modify the `VITE_SERVICE_SUCCESS_CODE` in `.env` file
      return String(response.data.code) === serviceSuccessCode;
    },
    async onBackendFail(response, instance) {
      const authStore = await resolveAuthStore();
      const responseCode = String(response.data.code);
      const responseMessage = String(response.data.msg || '');
      const isLogoutRequest = String(response.config?.url || '').includes('/auth/logout');

      function handleLocalLogout() {
        authStore.resetStore().catch(() => undefined);
      }

      async function handlePassiveLogout(notifyBackend = true) {
        if (passiveLogoutInProgress) {
          return;
        }

        passiveLogoutInProgress = true;

        try {
          if (isLogoutRequest) {
            await authStore.resetStore();
            return;
          }

          await authStore.logout({ notifyBackend });
        } finally {
          passiveLogoutInProgress = false;
        }
      }

      function logoutAndCleanup() {
        handlePassiveLogout().catch(() => undefined);
        window.removeEventListener('beforeunload', handleLocalLogout);

        request.state.errMsgStack = request.state.errMsgStack.filter(msg => msg !== response.data.msg);
      }

      // Inactive user/tenant are hard session boundaries: single message + forced local logout.
      if (
        isTenantInactivePayload(responseCode, responseMessage) ||
        isUserInactivePayload(responseCode, responseMessage)
      ) {
        showErrorMsg(request.state, responseMessage);
        await handlePassiveLogout(false);
        return null;
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      if (logoutCodes.includes(responseCode)) {
        await handlePassiveLogout();
        return null;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      if (modalLogoutCodes.includes(responseCode) && isLogoutRequest) {
        await handlePassiveLogout(false);
        return null;
      }

      if (modalLogoutCodes.includes(responseCode) && !request.state.errMsgStack?.includes(response.data.msg)) {
        request.state.errMsgStack = [...(request.state.errMsgStack || []), response.data.msg];

        // prevent the user from refreshing the page
        window.addEventListener('beforeunload', handleLocalLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          content: response.data.msg,
          positiveText: $t('common.confirm'),
          maskClosable: false,
          closeOnEsc: false,
          onPositiveClick() {
            logoutAndCleanup();
          },
          onClose() {
            logoutAndCleanup();
          }
        });

        return null;
      }

      // when the backend response code is in `expiredTokenCodes`, it means the token is expired, and refresh token
      // the api `refreshToken` can not return error code in `expiredTokenCodes`, otherwise it will be a dead loop, should return `logoutCodes` or `modalLogoutCodes`
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      return null;
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;
      let backendErrorCode = '';

      // get backend error message and code
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.msg || message;
        backendErrorCode = String(error.response?.data?.code || '');
      }

      if (passiveLogoutInProgress || shouldSkipGlobalErrorToast(error)) {
        return;
      }

      const handleValidationErrorLocally = (error.config as { handleValidationErrorLocally?: boolean } | undefined)
        ?.handleValidationErrorLocally;

      if (handleValidationErrorLocally && isValidationErrorPayload(error)) {
        return;
      }

      if (isSessionEndingCode(backendErrorCode)) {
        return;
      }

      // the error message is displayed in the modal
      if (modalLogoutCodes.includes(backendErrorCode)) {
        return;
      }

      // when the token is expired, refresh token and retry request, so no need to show error message
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      // 4020 is our custom '2FA Required' code during login. We bypass the global error message
      // because the login component needs to handle this gracefully to show the OTP input.
      if (backendErrorCode === '4020') {
        return;
      }

      showErrorMsg(request.state, message);
    }
  }
);

export const demoRequest = createRequest(
  {
    baseURL: otherBaseURL.demo,
    adapter: demoAxiosAdapter
  },
  {
    transform(response: AxiosResponse<App.Service.DemoResponse>) {
      return response.data.result;
    },
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = getToken();
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "200", it means the request is success
      // you can change this logic by yourself
      return response.data.status === '200';
    },
    async onBackendFail(_response) {
      // when the backend response code is not "200", it means the request is fail
      // for example: the token is expired, refresh token and retry request
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;

      // show backend error message
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
