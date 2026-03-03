import { request } from '../request';
import { getTenantList } from './generated';
import { callGeneratedApi, createCrudHandlers } from './shared';

/**
 * Get tenant list
 *
 * @param params Query params
 */
export function fetchGetTenantList(
  params: Api.Tenant.TenantListParams
): ReturnType<typeof request<Api.Tenant.TenantList>> {
  return callGeneratedApi<Api.Tenant.TenantList>(() =>
    getTenantList({
      query: params
    } as unknown as Parameters<typeof getTenantList>[0])
  );
}

/** Get all active tenants */
export function fetchGetAllTenants() {
  return request<{ records: Api.Tenant.TenantOption[] }>({
    url: '/tenant/all'
  });
}

const tenantCrud = createCrudHandlers<Api.Tenant.TenantPayload>('/tenant');

/** Create tenant */
export const fetchCreateTenant = tenantCrud.create;

/** Update tenant */
export const fetchUpdateTenant = tenantCrud.update;

/** Delete tenant */
export const fetchDeleteTenant = tenantCrud.remove;
