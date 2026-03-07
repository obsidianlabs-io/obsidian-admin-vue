import type { CustomAxiosRequestConfig } from '@sa/axios';
import { request } from '../request';
import { buildResourceItemUrl } from './url';

/** Get team list */
export function fetchGetTeamList(params: Api.Team.TeamListParams) {
  return request<Api.Team.TeamList>({
    url: '/team/list',
    params
  });
}

/** Get all active teams */
export function fetchGetAllTeams(params?: { organizationId?: number }) {
  return request<{ records: Api.Team.TeamOption[] }>({
    url: '/team/all',
    params
  });
}

/** Create team */
export function fetchCreateTeam(data: Api.Team.TeamPayload, config?: CustomAxiosRequestConfig) {
  return request<unknown>({
    url: '/team',
    method: 'post',
    data,
    ...config
  });
}

/** Update team */
export function fetchUpdateTeam(id: number, data: Api.Team.TeamPayload, config?: CustomAxiosRequestConfig) {
  return request<unknown>({
    url: buildResourceItemUrl('/team', id),
    method: 'put',
    data,
    ...config
  });
}

/** Delete team */
export function fetchDeleteTeam(id: number) {
  return request<unknown>({
    url: buildResourceItemUrl('/team', id),
    method: 'delete'
  });
}
