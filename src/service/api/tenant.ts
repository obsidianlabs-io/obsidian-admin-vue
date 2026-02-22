import { request } from '../request';
import { callGenerated } from './generated-adapter';
import { getTenantList } from './generated';

/**
 * Get tenant list
 *
 * @param params Query params
 */
export function fetchGetTenantList(
  params: Api.Tenant.TenantListParams
): ReturnType<typeof request<Api.Tenant.TenantList>> {
  return callGenerated<Api.Tenant.TenantList>(() => getTenantList({ query: params } as any)) as ReturnType<
    typeof request<Api.Tenant.TenantList>
  >;
}

/** Get all active tenants */
export function fetchGetAllTenants() {
  return request<{ records: Api.Tenant.TenantOption[] }>({
    url: '/tenant/all'
  });
}

/**
 * Create tenant
 *
 * @param data Payload
 */
export function fetchCreateTenant(data: Api.Tenant.TenantPayload) {
  return request<unknown>({
    url: '/tenant',
    method: 'post',
    data
  });
}

/**
 * Update tenant
 *
 * @param id Tenant id
 * @param data Payload
 */
export function fetchUpdateTenant(id: number, data: Api.Tenant.TenantPayload) {
  return request<unknown>({
    url: `/tenant/${id}`,
    method: 'put',
    data
  });
}

/**
 * Delete tenant
 *
 * @param id Tenant id
 */
export function fetchDeleteTenant(id: number) {
  return request<unknown>({
    url: `/tenant/${id}`,
    method: 'delete'
  });
}
