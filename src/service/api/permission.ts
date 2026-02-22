import { request } from '../request';
import { callGenerated } from './generated-adapter';
import { getPermissionList } from './generated';

/**
 * Get permission list
 *
 * @param params Query params
 */
export function fetchGetPermissionList(
  params: Api.Permission.PermissionListParams
): ReturnType<typeof request<Api.Permission.PermissionList>> {
  return callGenerated<Api.Permission.PermissionList>(() => getPermissionList({ query: params } as any)) as ReturnType<
    typeof request<Api.Permission.PermissionList>
  >;
}

/** Get all active permissions */
export function fetchGetAllPermissions() {
  return request<{ records: Api.Permission.PermissionOption[] }>({
    url: '/permission/all'
  });
}

/**
 * Create permission
 *
 * @param data Payload
 */
export function fetchCreatePermission(data: Api.Permission.PermissionPayload) {
  return request<unknown>({
    url: '/permission',
    method: 'post',
    data
  });
}

/**
 * Update permission
 *
 * @param id Permission id
 * @param data Payload
 */
export function fetchUpdatePermission(id: number, data: Api.Permission.PermissionPayload) {
  return request<unknown>({
    url: `/permission/${id}`,
    method: 'put',
    data
  });
}

/**
 * Delete permission
 *
 * @param id Permission id
 */
export function fetchDeletePermission(id: number) {
  return request<unknown>({
    url: `/permission/${id}`,
    method: 'delete'
  });
}
