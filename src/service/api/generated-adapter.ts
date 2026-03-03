import { getServiceBaseURL } from '@/utils/service';
import { request } from '../request';
import {
  createRequestContextHeaders,
  expiredTokenCodes,
  handleExpiredRequest,
  modalLogoutCodes,
  serviceSuccessCode,
  showErrorMsg
} from '../request/shared';
import { client as generatedClient } from './generated/client.gen';
import { createGeneratedCaller } from './generated-caller';

const runtimeEnv = ((import.meta as ImportMeta & { env?: Partial<Env.ImportMeta> }).env ||
  {}) as Partial<Env.ImportMeta>;
const isHttpProxy = runtimeEnv.DEV === true && runtimeEnv.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(runtimeEnv as Env.ImportMeta, isHttpProxy);
const apifoxToken = runtimeEnv.DEV ? String(runtimeEnv.VITE_APIFOX_TOKEN || '').trim() : '';
const defaultHeaders = apifoxToken ? { apifoxToken } : {};

generatedClient.setConfig({
  baseURL,
  headers: defaultHeaders,
  requestValidator: async rawOptions => {
    const options = rawOptions as { headers?: Record<string, unknown> };
    options.headers = createRequestContextHeaders(options.headers as Record<string, unknown>);
  }
});

export const callGenerated = createGeneratedCaller({
  successCode: serviceSuccessCode,
  modalLogoutCodes,
  expiredTokenCodes,
  handleExpiredRequest: () => handleExpiredRequest(request.state),
  showErrorMsg: message => showErrorMsg(request.state, message)
});
