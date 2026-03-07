import type { CustomAxiosRequestConfig } from '@sa/axios';
import {
  deletePermissionById,
  getPermissionAll,
  getPermissionList,
  postPermission,
  putPermissionById
} from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get permission list
 *
 * @param params Query params
 */
export function fetchGetPermissionList(params: Api.Permission.PermissionListParams) {
  return callGenerated<Api.Permission.PermissionList>(() =>
    getPermissionList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get all active permissions */
export function fetchGetAllPermissions() {
  return callGenerated<{ records: Api.Permission.PermissionOption[] }>(() => getPermissionAll());
}

/** Create permission */
export function fetchCreatePermission(data: Api.Permission.PermissionPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    postPermission(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/** Update permission */
export function fetchUpdatePermission(
  id: number,
  data: Api.Permission.PermissionPayload,
  config?: CustomAxiosRequestConfig
) {
  return callGenerated<unknown>(() =>
    putPermissionById(
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

/** Delete permission */
export function fetchDeletePermission(id: number) {
  return callGenerated<unknown>(() =>
    deletePermissionById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}
