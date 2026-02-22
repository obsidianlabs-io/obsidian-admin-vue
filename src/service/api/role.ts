import { request } from '../request';
import { callGenerated } from './generated-adapter';
import { getRoleList } from './generated';

/**
 * Get role list
 *
 * @param params Query params
 */
export function fetchGetRoleList(params: Api.Role.RoleListParams): ReturnType<typeof request<Api.Role.RoleList>> {
  return callGenerated<Api.Role.RoleList>(() => getRoleList({ query: params } as any)) as ReturnType<
    typeof request<Api.Role.RoleList>
  >;
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

/**
 * Create role
 *
 * @param data Payload
 */
export function fetchCreateRole(data: Api.Role.RolePayload) {
  return request<unknown>({
    url: '/role',
    method: 'post',
    data
  });
}

/**
 * Update role
 *
 * @param id Role id
 * @param data Payload
 */
export function fetchUpdateRole(id: number, data: Api.Role.RolePayload) {
  return request<unknown>({
    url: `/role/${id}`,
    method: 'put',
    data
  });
}

/**
 * Delete role
 *
 * @param id Role id
 */
export function fetchDeleteRole(id: number) {
  return request<unknown>({
    url: `/role/${id}`,
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
    url: `/role/${id}/permissions`,
    method: 'put',
    data: {
      permissionCodes
    }
  });
}
