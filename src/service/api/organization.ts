import { request } from '../request';
import { buildResourceItemUrl } from './url';

/** Get organization list */
export function fetchGetOrganizationList(params: Api.Organization.OrganizationListParams) {
  return request<Api.Organization.OrganizationList>({
    url: '/organization/list',
    params
  });
}

/** Get all active organizations */
export function fetchGetAllOrganizations() {
  return request<{ records: Api.Organization.OrganizationOption[] }>({
    url: '/organization/all'
  });
}

/** Create organization */
export function fetchCreateOrganization(data: Api.Organization.OrganizationPayload) {
  return request<unknown>({
    url: '/organization',
    method: 'post',
    data
  });
}

/** Update organization */
export function fetchUpdateOrganization(id: number, data: Api.Organization.OrganizationPayload) {
  return request<unknown>({
    url: buildResourceItemUrl('/organization', id),
    method: 'put',
    data
  });
}

/** Delete organization */
export function fetchDeleteOrganization(id: number) {
  return request<unknown>({
    url: buildResourceItemUrl('/organization', id),
    method: 'delete'
  });
}
