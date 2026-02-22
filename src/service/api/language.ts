import { request } from '../request';

/**
 * Get language translation list
 *
 * @param params Query params
 */
export function fetchGetLanguageList(params: Api.Language.TranslationListParams) {
  return request<Api.Language.TranslationList>({
    url: '/language/list',
    params
  });
}

/** Get language options */
export function fetchGetLanguageOptions() {
  return request<{ records: Api.Language.LanguageOption[] }>({
    url: '/language/options'
  });
}

/** Get runtime active locale options */
export function fetchGetRuntimeLocales() {
  return request<{ records: Api.Language.LanguageOption[] }>({
    url: '/language/locales'
  });
}

/** Get runtime locale messages */
export function fetchGetRuntimeLocaleMessages(params: Api.Language.RuntimeMessagesParams) {
  return request<Api.Language.RuntimeMessagesPayload>({
    url: '/language/messages',
    params
  });
}

/**
 * Create translation item
 *
 * @param data Payload
 */
export function fetchCreateLanguageTranslation(data: Api.Language.TranslationPayload) {
  return request<unknown>({
    url: '/language',
    method: 'post',
    data
  });
}

/**
 * Update translation item
 *
 * @param id Translation id
 * @param data Payload
 */
export function fetchUpdateLanguageTranslation(id: number, data: Api.Language.TranslationPayload) {
  return request<unknown>({
    url: `/language/${id}`,
    method: 'put',
    data
  });
}

/**
 * Delete translation item
 *
 * @param id Translation id
 */
export function fetchDeleteLanguageTranslation(id: number) {
  return request<unknown>({
    url: `/language/${id}`,
    method: 'delete'
  });
}
