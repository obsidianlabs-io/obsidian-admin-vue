import { request } from '../request';
import { createCrudHandlers } from './shared';

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

const userCrud = createCrudHandlers<Api.User.UserPayload>('/user');

/** Create user */
export const fetchCreateUser = userCrud.create;

/** Update user */
export const fetchUpdateUser = userCrud.update;

/** Delete user */
export const fetchDeleteUser = userCrud.remove;
