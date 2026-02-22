import { request } from '../request';

/**
 * Fetch backend-driven CRUD schema metadata for a resource.
 *
 * @param resource resource key, e.g. "user"
 */
export function fetchGetCrudSchema(resource: string) {
  return request<Api.CrudSchema.Schema>({
    url: `/system/ui/crud-schema/${resource}`
  });
}
