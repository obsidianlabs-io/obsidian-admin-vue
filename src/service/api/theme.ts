import { request } from '../request';

/** Get current scope theme configuration */
export function fetchGetThemeConfig() {
  return request<Api.Theme.ScopeConfigPayload>({
    url: '/theme/config'
  });
}

/** Get public theme configuration for guest pages like login */
export function fetchGetPublicThemeConfig() {
  return request<Api.Theme.ScopeConfigPayload>({
    url: '/theme/public-config'
  });
}

/** Update current scope theme configuration */
export function fetchUpdateThemeConfig(data: Partial<Api.Theme.Config>) {
  return request<Api.Theme.ScopeConfigPayload>({
    url: '/theme/config',
    method: 'put',
    data
  });
}

/** Reset current scope theme configuration to defaults */
export function fetchResetThemeConfig() {
  return request<Api.Theme.ScopeConfigPayload>({
    url: '/theme/config/reset',
    method: 'post'
  });
}
