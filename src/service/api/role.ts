import type { CustomAxiosRequestConfig } from '@sa/axios';
import { request } from '../request';
import { buildResourceItemUrl } from './url';

/**
 * Get role list
 *
 * @param params Query params
 */
export function fetchGetRoleList(params: Api.Role.RoleListParams): ReturnType<typeof request<Api.Role.RoleList>> {
  return request<Api.Role.RoleList>({
    url: '/role/list',
    params
  });
}

/** Get all active roles */
export function fetchGetAllRoles(params?: { manageableOnly?: boolean }) {
  return request<{ records: Api.Role.RoleOption[] }>({
    url: '/role/all',
    params
  });
}

/** Get assignable permissions for role form */
export function fetchGetRoleAssignablePermissions() {
  return request<{ records: Api.Permission.PermissionOption[] }>({
    url: '/role/assignable-permissions'
  });
}

/** Create role */
export function fetchCreateRole(data: Api.Role.RolePayload, config?: CustomAxiosRequestConfig) {
  return request<unknown>({
    url: '/role',
    method: 'post',
    data,
    ...config
  });
}

/** Update role */
export function fetchUpdateRole(id: number, data: Api.Role.RolePayload, config?: CustomAxiosRequestConfig) {
  return request<unknown>({
    url: buildResourceItemUrl('/role', id),
    method: 'put',
    data,
    ...config
  });
}

/** Delete role */
export function fetchDeleteRole(id: number) {
  return request<unknown>({
    url: buildResourceItemUrl('/role', id),
    method: 'delete'
  });
}

/**
 * Sync role permissions
 *
 * @param id Role id
 * @param permissionCodes Permission code list
 */
export function fetchSyncRolePermissions(id: number, permissionCodes: string[]) {
  return request<unknown>({
    url: `${buildResourceItemUrl('/role', id)}/permissions`,
    method: 'put',
    data: {
      permissionCodes
    }
  });
}
