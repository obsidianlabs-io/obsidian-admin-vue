import type { AxiosResponse } from 'axios';

const BACKEND_ERROR_CODE = 'BACKEND_ERROR';

interface GeneratedCallOptions {
  silentCodes?: string[];
  retryOnExpired?: boolean;
}

interface CreateGeneratedCallerOptions {
  successCode: string;
  modalLogoutCodes: string[];
  expiredTokenCodes: string[];
  handleExpiredRequest: () => Promise<boolean>;
  showErrorMsg: (message: string) => void;
}

interface GeneratedCallReturn<T> {
  data: T | null;
  error: any;
  response: AxiosResponse | undefined;
}

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

export function createGeneratedCaller(options: CreateGeneratedCallerOptions) {
  // eslint-disable-next-line complexity
  async function callGenerated<T>(
    call: () => Promise<any>,
    callOptions: GeneratedCallOptions = {}
  ): Promise<GeneratedCallReturn<T>> {
    const { silentCodes = [], retryOnExpired = true } = callOptions;
    const mutedCodes = new Set([...options.modalLogoutCodes, ...silentCodes]);
    const result = await call();

    if (result?.error !== undefined && result?.data === undefined) {
      const backendCode = String(result?.response?.data?.code ?? '');

      if (retryOnExpired && options.expiredTokenCodes.includes(backendCode)) {
        const refreshed = await options.handleExpiredRequest();
        if (refreshed) {
          return callGenerated<T>(call, { ...callOptions, retryOnExpired: false });
        }
      }

      if (!mutedCodes.has(backendCode)) {
        const message = result?.response?.data?.msg || result?.message || 'Request failed';
        options.showErrorMsg(message);
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
    if (responseCode === options.successCode) {
      return {
        data: payload.data as T,
        error: null,
        response
      };
    }

    if (retryOnExpired && options.expiredTokenCodes.includes(responseCode)) {
      const refreshed = await options.handleExpiredRequest();
      if (refreshed) {
        return callGenerated<T>(call, { ...callOptions, retryOnExpired: false });
      }
    }

    const backendError = createBackendError(responseCode, payload, response);
    if (!mutedCodes.has(responseCode)) {
      options.showErrorMsg(payload.msg || 'Request failed');
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

  return callGenerated;
}
