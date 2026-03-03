import { request } from '../request';
import { getRoleList } from './generated';
import { callGeneratedApi, createCrudHandlers } from './shared';

/**
 * Get role list
 *
 * @param params Query params
 */
export function fetchGetRoleList(params: Api.Role.RoleListParams): ReturnType<typeof request<Api.Role.RoleList>> {
  return callGeneratedApi<Api.Role.RoleList>(() =>
    getRoleList({
      query: params
    } as unknown as Parameters<typeof getRoleList>[0])
  );
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

const roleCrud = createCrudHandlers<Api.Role.RolePayload>('/role');

/** Create role */
export const fetchCreateRole = roleCrud.create;

/** Update role */
export const fetchUpdateRole = roleCrud.update;

/** Delete role */
export const fetchDeleteRole = roleCrud.remove;

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
