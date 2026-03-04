import { request } from '../request';
import { buildResourceItemUrl } from './url';

/**
 * Get permission list
 *
 * @param params Query params
 */
export function fetchGetPermissionList(
  params: Api.Permission.PermissionListParams
): ReturnType<typeof request<Api.Permission.PermissionList>> {
  return request<Api.Permission.PermissionList>({
    url: '/permission/list',
    params
  });
}

/** Get all active permissions */
export function fetchGetAllPermissions() {
  return request<{ records: Api.Permission.PermissionOption[] }>({
    url: '/permission/all'
  });
}

/** Create permission */
export function fetchCreatePermission(data: Api.Permission.PermissionPayload) {
  return request<unknown>({
    url: '/permission',
    method: 'post',
    data
  });
}

/** Update permission */
export function fetchUpdatePermission(id: number, data: Api.Permission.PermissionPayload) {
  return request<unknown>({
    url: buildResourceItemUrl('/permission', id),
    method: 'put',
    data
  });
}

/** Delete permission */
export function fetchDeletePermission(id: number) {
  return request<unknown>({
    url: buildResourceItemUrl('/permission', id),
    method: 'delete'
  });
}
