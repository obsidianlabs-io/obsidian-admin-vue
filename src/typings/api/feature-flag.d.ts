declare namespace Api {
  /**
   * namespace FeatureFlag
   *
   * backend api module: "system/feature-flags"
   */
  namespace FeatureFlag {
    interface Flag {
      key: string;
      enabled: boolean;
      percentage: number;
      platform_only: boolean;
      tenant_only: boolean;
      role_codes: string[];
      global_override: boolean | null;
    }

    type ListResponse = Common.PaginatingQueryRecord<Flag>;

    interface SearchParams
      extends Partial<BackendGenerated.DTO.FeatureFlag.ListFeatureFlagsDTO>, Common.CommonSearchParams {}

    interface ToggleResponse {
      key: string;
      global_override: boolean;
    }

    interface PurgeResponse {
      key: string;
      global_override: null;
    }

    type TogglePayload = BackendGenerated.DTO.FeatureFlag.ToggleFeatureFlagDTO;

    type PurgePayload = BackendGenerated.DTO.FeatureFlag.PurgeFeatureFlagDTO;
  }
}
