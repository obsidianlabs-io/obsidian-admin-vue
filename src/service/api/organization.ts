import { request } from '../request';
import { createCrudHandlers } from './shared';

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

const organizationCrud = createCrudHandlers<Api.Organization.OrganizationPayload>('/organization');

/** Create organization */
export const fetchCreateOrganization = organizationCrud.create;

/** Update organization */
export const fetchUpdateOrganization = organizationCrud.update;

/** Delete organization */
export const fetchDeleteOrganization = organizationCrud.remove;
