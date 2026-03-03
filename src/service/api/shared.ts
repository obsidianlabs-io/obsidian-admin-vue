import { request } from '../request';
import { callGenerated } from './generated-adapter';

type Id = number | string;

export type ApiRequestResult<T> = ReturnType<typeof request<T>>;

interface GeneratedCallOptions {
  silentCodes?: string[];
  retryOnExpired?: boolean;
}

export function createCrudHandlers<TPayload>(resourcePath: string) {
  function create(data: TPayload) {
    return request<unknown>({
      url: resourcePath,
      method: 'post',
      data
    });
  }

  function update(id: Id, data: TPayload) {
    return request<unknown>({
      url: `${resourcePath}/${id}`,
      method: 'put',
      data
    });
  }

  function remove(id: Id) {
    return request<unknown>({
      url: `${resourcePath}/${id}`,
      method: 'delete'
    });
  }

  return {
    create,
    update,
    remove
  };
}

export function callGeneratedApi<TData>(
  call: () => Promise<unknown>,
  callOptions?: GeneratedCallOptions
): ApiRequestResult<TData> {
  return callGenerated<TData>(call, callOptions) as ApiRequestResult<TData>;
}
