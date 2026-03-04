import { request } from '../request';
import { buildResourceItemUrl } from './url';

/**
 * Get user list
 *
 * @param params Query params
 */
export function fetchGetUserList(params: Api.User.UserListParams): ReturnType<typeof request<Api.User.UserList>> {
  return request<Api.User.UserList>({
    url: '/user/list',
    params
  });
}

/** Create user */
export function fetchCreateUser(data: Api.User.UserPayload) {
  return request<unknown>({
    url: '/user',
    method: 'post',
    data
  });
}

/** Update user */
export function fetchUpdateUser(id: number, data: Api.User.UserPayload) {
  return request<unknown>({
    url: buildResourceItemUrl('/user', id),
    method: 'put',
    data
  });
}

/** Delete user */
export function fetchDeleteUser(id: number) {
  return request<unknown>({
    url: buildResourceItemUrl('/user', id),
    method: 'delete'
  });
}
