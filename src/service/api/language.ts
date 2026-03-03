import { request } from '../request';
import { createCrudHandlers } from './shared';

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

const languageCrud = createCrudHandlers<Api.Language.TranslationPayload>('/language');

/** Create translation item */
export const fetchCreateLanguageTranslation = languageCrud.create;

/** Update translation item */
export const fetchUpdateLanguageTranslation = languageCrud.update;

/** Delete translation item */
export const fetchDeleteLanguageTranslation = languageCrud.remove;
