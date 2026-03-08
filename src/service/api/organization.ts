import type { CustomAxiosRequestConfig } from '@sa/axios';
import {
  deleteOrganizationById,
  getOrganizationAll,
  getOrganizationList,
  postOrganization,
  putOrganizationById
} from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/** Get organization list */
export function fetchGetOrganizationList(params: Api.Organization.OrganizationListParams) {
  return callGenerated<Api.Organization.OrganizationList>(() =>
    getOrganizationList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get all active organizations */
export function fetchGetAllOrganizations() {
  return callGenerated<{ records: Api.Organization.OrganizationOption[] }>(() => getOrganizationAll());
}

/** Create organization */
export function fetchCreateOrganization(data: Api.Organization.OrganizationPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    postOrganization(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/** Update organization */
export function fetchUpdateOrganization(
  id: number,
  data: Api.Organization.OrganizationPayload,
  config?: CustomAxiosRequestConfig
) {
  return callGenerated<unknown>(() =>
    putOrganizationById(
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

/** Delete organization */
export function fetchDeleteOrganization(id: number) {
  return callGenerated<unknown>(() =>
    deleteOrganizationById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}
