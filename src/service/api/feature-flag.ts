import { deleteSystemFeatureFlagsPurge, getSystemFeatureFlags, putSystemFeatureFlagsToggle } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/** Fetch all feature flag definitions with overrides */
export function fetchFeatureFlags(params?: Api.FeatureFlag.SearchParams) {
  return callGenerated<Api.FeatureFlag.ListResponse>(() =>
    getSystemFeatureFlags(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Toggle a feature flag's global override */
export function toggleFeatureFlag(key: string, enabled: boolean) {
  const payload: Api.FeatureFlag.TogglePayload = { key, enabled };

  return callGenerated<Api.FeatureFlag.ToggleResponse>(() =>
    putSystemFeatureFlagsToggle(
      buildGeneratedOptions({
        body: payload
      })
    )
  );
}

/** Purge all overrides for a feature flag (revert to defaults) */
export function purgeFeatureFlag(key: string) {
  const payload: Api.FeatureFlag.PurgePayload = { key };

  return callGenerated<Api.FeatureFlag.PurgeResponse>(() =>
    deleteSystemFeatureFlagsPurge(
      buildGeneratedOptions({
        body: payload
      })
    )
  );
}
