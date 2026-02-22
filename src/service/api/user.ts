import { request } from '../request';
import { callGenerated } from './generated-adapter';
import { getUserList } from './generated';

/**
 * Get user list
 *
 * @param params Query params
 */
export function fetchGetUserList(params: Api.User.UserListParams): ReturnType<typeof request<Api.User.UserList>> {
  return callGenerated<Api.User.UserList>(() => getUserList({ query: params } as any)) as ReturnType<
    typeof request<Api.User.UserList>
  >;
}

/**
 * Create user
 *
 * @param data Payload
 */
export function fetchCreateUser(data: Api.User.UserPayload) {
  return request<unknown>({
    url: '/user',
    method: 'post',
    data
  });
}

/**
 * Update user
 *
 * @param id User id
 * @param data Payload
 */
export function fetchUpdateUser(id: number, data: Api.User.UserPayload) {
  return request<unknown>({
    url: `/user/${id}`,
    method: 'put',
    data
  });
}

/**
 * Delete user
 *
 * @param id User id
 */
export function fetchDeleteUser(id: number) {
  return request<unknown>({
    url: `/user/${id}`,
    method: 'delete'
  });
}
