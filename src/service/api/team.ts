import { request } from '../request';
import { createCrudHandlers } from './shared';

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

const teamCrud = createCrudHandlers<Api.Team.TeamPayload>('/team');

/** Create team */
export const fetchCreateTeam = teamCrud.create;

/** Update team */
export const fetchUpdateTeam = teamCrud.update;

/** Delete team */
export const fetchDeleteTeam = teamCrud.remove;
