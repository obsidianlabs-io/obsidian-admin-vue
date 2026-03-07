import type { CustomAxiosRequestConfig } from '@sa/axios';
import {
  deleteRoleById,
  getRoleAll,
  getRoleAssignablePermissions,
  getRoleList,
  postRole,
  putRoleById,
  putRoleByIdPermissions
} from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get role list
 *
 * @param params Query params
 */
export function fetchGetRoleList(params: Api.Role.RoleListParams) {
  return callGenerated<Api.Role.RoleList>(() =>
    getRoleList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get all active roles */
export function fetchGetAllRoles(params?: { manageableOnly?: boolean }) {
  return callGenerated<{ records: Api.Role.RoleOption[] }>(() =>
    getRoleAll(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get assignable permissions for role form */
export function fetchGetRoleAssignablePermissions() {
  return callGenerated<{ records: Api.Permission.PermissionOption[] }>(() => getRoleAssignablePermissions());
}

/** Create role */
export function fetchCreateRole(data: Api.Role.RolePayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    postRole(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/** Update role */
export function fetchUpdateRole(id: number, data: Api.Role.RolePayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    putRoleById(
      buildGeneratedOptions(
        {
          path: { id },
          body: data
        },
        config
      )
    )
  );
}

/** Delete role */
export function fetchDeleteRole(id: number) {
  return callGenerated<unknown>(() =>
    deleteRoleById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}

/**
 * Sync role permissions
 *
 * @param id Role id
 * @param permissionCodes Permission code list
 */
export function fetchSyncRolePermissions(id: number, permissionCodes: string[]) {
  return callGenerated<unknown>(() =>
    putRoleByIdPermissions(
      buildGeneratedOptions({
        path: { id },
        body: {
          permissionCodes
        }
      })
    )
  );
}
