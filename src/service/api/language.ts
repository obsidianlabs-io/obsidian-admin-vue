import type { CustomAxiosRequestConfig } from '@sa/axios';
import {
  deleteLanguageById,
  getLanguageList,
  getLanguageLocales,
  getLanguageMessages,
  getLanguageOptions,
  postLanguage,
  putLanguageById
} from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get language translation list
 *
 * @param params Query params
 */
export function fetchGetLanguageList(params: Api.Language.TranslationListParams) {
  return callGenerated<Api.Language.TranslationList>(() =>
    getLanguageList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get language options */
export function fetchGetLanguageOptions() {
  return callGenerated<{ records: Api.Language.LanguageOption[] }>(() => getLanguageOptions());
}

/** Get runtime active locale options */
export function fetchGetRuntimeLocales() {
  return callGenerated<{ records: Api.Language.LanguageOption[] }>(() => getLanguageLocales());
}

/** Get runtime locale messages */
export function fetchGetRuntimeLocaleMessages(params: Api.Language.RuntimeMessagesParams) {
  return callGenerated<Api.Language.RuntimeMessagesPayload>(() =>
    getLanguageMessages(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Create translation item */
export function fetchCreateLanguageTranslation(
  data: Api.Language.TranslationPayload,
  config?: CustomAxiosRequestConfig
) {
  return callGenerated<unknown>(() =>
    postLanguage(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/** Update translation item */
export function fetchUpdateLanguageTranslation(
  id: number,
  data: Api.Language.TranslationPayload,
  config?: CustomAxiosRequestConfig
) {
  return callGenerated<unknown>(() =>
    putLanguageById(
      buildGeneratedOptions(
        {
          path: { id },
          body: data
        },
        config
      )
    )
  );
}

/** Delete translation item */
export function fetchDeleteLanguageTranslation(id: number) {
  return callGenerated<unknown>(() =>
    deleteLanguageById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}
