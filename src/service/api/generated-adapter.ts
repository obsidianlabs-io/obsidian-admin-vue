import type { CustomAxiosRequestConfig } from '@sa/axios';
import { getServiceBaseURL } from '@/utils/service';
import { request } from '../request';
import { createGeneratedCaller } from './generated-caller';
import { client as generatedClient } from './generated/client.gen';

const runtimeEnv = ((import.meta as ImportMeta & { env?: Partial<Env.ImportMeta> }).env ||
  {}) as Partial<Env.ImportMeta>;
const isHttpProxy = runtimeEnv.DEV === true && runtimeEnv.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(runtimeEnv as Env.ImportMeta, isHttpProxy);
const apifoxToken = runtimeEnv.DEV ? String(runtimeEnv.VITE_APIFOX_TOKEN || '').trim() : '';
const defaultHeaders = apifoxToken ? { apifoxToken } : {};

generatedClient.setConfig({
  axios: request.instance,
  baseURL,
  headers: defaultHeaders
});

export type GeneratedRequestConfig = Pick<
  CustomAxiosRequestConfig,
  | 'handleValidationErrorLocally'
  | 'headers'
  | 'onDownloadProgress'
  | 'onUploadProgress'
  | 'responseType'
  | 'signal'
  | 'timeout'
  | 'withCredentials'
>;

export function buildGeneratedOptions<TOptions extends Record<string, unknown>>(
  data: TOptions,
  config?: GeneratedRequestConfig
): TOptions & GeneratedRequestConfig {
  return {
    ...data,
    ...(config ?? {})
  };
}

export const callGenerated = createGeneratedCaller();
