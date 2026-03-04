import { request } from '../request';
import { createCrudHandlers } from './shared';

/**
 * Get tenant list
 *
 * @param params Query params
 */
export function fetchGetTenantList(
  params: Api.Tenant.TenantListParams
): ReturnType<typeof request<Api.Tenant.TenantList>> {
  return request<Api.Tenant.TenantList>({
    url: '/tenant/list',
    params
  });
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
