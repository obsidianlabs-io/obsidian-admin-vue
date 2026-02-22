import { request } from '../request';

/** Fetch all feature flag definitions with overrides */
export function fetchFeatureFlags(params?: Api.FeatureFlag.SearchParams) {
  return request<Api.FeatureFlag.ListResponse>({
    url: '/system/feature-flags',
    params
  });
}

/** Toggle a feature flag's global override */
export function toggleFeatureFlag(key: string, enabled: boolean) {
  const payload: Api.FeatureFlag.TogglePayload = { key, enabled };

  return request<Api.FeatureFlag.ToggleResponse>({
    url: '/system/feature-flags/toggle',
    method: 'put',
    data: payload
  });
}

/** Purge all overrides for a feature flag (revert to defaults) */
export function purgeFeatureFlag(key: string) {
  const payload: Api.FeatureFlag.PurgePayload = { key };

  return request<Api.FeatureFlag.PurgeResponse>({
    url: '/system/feature-flags/purge',
    method: 'delete',
    data: payload
  });
}
