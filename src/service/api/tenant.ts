import type { CustomAxiosRequestConfig } from '@sa/axios';
import { request } from '../request';
import { buildResourceItemUrl } from './url';

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

/** Create tenant */
export function fetchCreateTenant(data: Api.Tenant.TenantPayload, config?: CustomAxiosRequestConfig) {
  return request<unknown>({
    url: '/tenant',
    method: 'post',
    data,
    ...config
  });
}

/** Update tenant */
export function fetchUpdateTenant(id: number, data: Api.Tenant.TenantPayload, config?: CustomAxiosRequestConfig) {
  return request<unknown>({
    url: buildResourceItemUrl('/tenant', id),
    method: 'put',
    data,
    ...config
  });
}

/** Delete tenant */
export function fetchDeleteTenant(id: number) {
  return request<unknown>({
    url: buildResourceItemUrl('/tenant', id),
    method: 'delete'
  });
}
