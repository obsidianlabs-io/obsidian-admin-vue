import { request } from '../request';
import { getPermissionList } from './generated';
import { callGeneratedApi, createCrudHandlers } from './shared';

/**
 * Get permission list
 *
 * @param params Query params
 */
export function fetchGetPermissionList(
  params: Api.Permission.PermissionListParams
): ReturnType<typeof request<Api.Permission.PermissionList>> {
  return callGeneratedApi<Api.Permission.PermissionList>(() =>
    getPermissionList({
      query: params
    } as unknown as Parameters<typeof getPermissionList>[0])
  );
}

/** Get all active permissions */
export function fetchGetAllPermissions() {
  return request<{ records: Api.Permission.PermissionOption[] }>({
    url: '/permission/all'
  });
}

const permissionCrud = createCrudHandlers<Api.Permission.PermissionPayload>('/permission');

/** Create permission */
export const fetchCreatePermission = permissionCrud.create;

/** Update permission */
export const fetchUpdatePermission = permissionCrud.update;

/** Delete permission */
export const fetchDeletePermission = permissionCrud.remove;
