import { getSystemUiCrudSchemaByResource } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Fetch backend-driven CRUD schema metadata for a resource.
 *
 * @param resource resource key, e.g. "user"
 */
export function fetchGetCrudSchema(resource: string) {
  return callGenerated<Api.CrudSchema.Schema>(() =>
    getSystemUiCrudSchemaByResource(
      buildGeneratedOptions({
        path: { resource }
      })
    )
  );
}
