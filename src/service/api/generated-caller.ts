import type { AxiosResponse } from 'axios';
import type { FlatResponseData } from '@sa/axios';

export function createGeneratedCaller() {
  async function callGenerated<T>(call: () => Promise<any>): Promise<FlatResponseData<any, T>> {
    const result = await call();

    if (result?.error !== undefined && result?.data === undefined) {
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

    return {
      data: payload.data as T,
      error: null,
      response
    };
  }

  return callGenerated;
}
