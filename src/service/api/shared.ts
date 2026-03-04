import { request } from '../request';

type Id = number | string;

export function createCrudHandlers<TPayload>(resourcePath: string) {
  function create(data: TPayload) {
    return request<unknown>({
      url: resourcePath,
      method: 'post',
      data
    });
  }

  function update(id: Id, data: TPayload) {
    const encodedId = encodeURIComponent(String(id));

    return request<unknown>({
      url: `${resourcePath}/${encodedId}`,
      method: 'put',
      data
    });
  }

  function remove(id: Id) {
    const encodedId = encodeURIComponent(String(id));

    return request<unknown>({
      url: `${resourcePath}/${encodedId}`,
      method: 'delete'
    });
  }

  return {
    create,
    update,
    remove
  };
}
