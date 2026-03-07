import type { CustomAxiosRequestConfig } from '@sa/axios';
import { deleteUserById, getUserList, postUser, putUserById } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get user list
 *
 * @param params Query params
 */
export function fetchGetUserList(params: Api.User.UserListParams) {
  return callGenerated<Api.User.UserList>(() =>
    getUserList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Create user */
export function fetchCreateUser(data: Api.User.UserPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    postUser(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/** Update user */
export function fetchUpdateUser(id: number, data: Api.User.UserPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    putUserById(
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

/** Delete user */
export function fetchDeleteUser(id: number) {
  return callGenerated<unknown>(() =>
    deleteUserById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}
