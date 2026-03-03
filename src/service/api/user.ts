import type { request } from '../request';
import { getUserList } from './generated';
import { callGeneratedApi, createCrudHandlers } from './shared';

/**
 * Get user list
 *
 * @param params Query params
 */
export function fetchGetUserList(params: Api.User.UserListParams): ReturnType<typeof request<Api.User.UserList>> {
  return callGeneratedApi<Api.User.UserList>(() =>
    getUserList({
      query: params
    } as unknown as Parameters<typeof getUserList>[0])
  );
}

const userCrud = createCrudHandlers<Api.User.UserPayload>('/user');

/** Create user */
export const fetchCreateUser = userCrud.create;

/** Update user */
export const fetchUpdateUser = userCrud.update;

/** Delete user */
export const fetchDeleteUser = userCrud.remove;
