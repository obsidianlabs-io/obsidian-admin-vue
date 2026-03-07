import type { CustomAxiosRequestConfig } from '@sa/axios';
import { deleteTenantById, getTenantAll, getTenantList, postTenant, putTenantById } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get tenant list
 *
 * @param params Query params
 */
export function fetchGetTenantList(params: Api.Tenant.TenantListParams) {
  return callGenerated<Api.Tenant.TenantList>(() =>
    getTenantList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get all active tenants */
export function fetchGetAllTenants() {
  return callGenerated<{ records: Api.Tenant.TenantOption[] }>(() => getTenantAll());
}

/** Create tenant */
export function fetchCreateTenant(data: Api.Tenant.TenantPayload, config?: CustomAxiosRequestConfig) {
  const payload = {
    ...data,
    status: data.status as Api.Common.EnableStatus | undefined
  };

  return callGenerated<unknown>(() =>
    postTenant(
      buildGeneratedOptions(
        {
          body: payload
        },
        config
      )
    )
  );
}

/** Update tenant */
export function fetchUpdateTenant(id: number, data: Api.Tenant.TenantPayload, config?: CustomAxiosRequestConfig) {
  const payload = {
    ...data,
    status: data.status as Api.Common.EnableStatus | undefined
  };

  return callGenerated<unknown>(() =>
    putTenantById(
      buildGeneratedOptions(
        {
          path: { id },
          body: payload
        },
        config
      )
    )
  );
}

/** Delete tenant */
export function fetchDeleteTenant(id: number) {
  return callGenerated<unknown>(() =>
    deleteTenantById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}
