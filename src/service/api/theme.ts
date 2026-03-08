import { getThemeConfig, getThemePublicConfig, postThemeConfigReset, putThemeConfig } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/** Get current scope theme configuration */
export function fetchGetThemeConfig() {
  return callGenerated<Api.Theme.ScopeConfigPayload>(() => getThemeConfig());
}

/** Get public theme configuration for guest pages like login */
export function fetchGetPublicThemeConfig() {
  return callGenerated<Api.Theme.ScopeConfigPayload>(() => getThemePublicConfig());
}

/** Update current scope theme configuration */
export function fetchUpdateThemeConfig(data: Partial<Api.Theme.Config>) {
  return callGenerated<Api.Theme.ScopeConfigPayload>(() =>
    putThemeConfig(
      buildGeneratedOptions({
        body: data
      })
    )
  );
}

/** Reset current scope theme configuration to defaults */
export function fetchResetThemeConfig() {
  return callGenerated<Api.Theme.ScopeConfigPayload>(() => postThemeConfigReset());
}
