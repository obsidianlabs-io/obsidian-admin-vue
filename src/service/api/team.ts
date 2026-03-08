import type { CustomAxiosRequestConfig } from '@sa/axios';
import { deleteTeamById, getTeamAll, getTeamList, postTeam, putTeamById } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/** Get team list */
export function fetchGetTeamList(params: Api.Team.TeamListParams) {
  return callGenerated<Api.Team.TeamList>(() =>
    getTeamList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Get all active teams */
export function fetchGetAllTeams(params?: { organizationId?: number }) {
  return callGenerated<{ records: Api.Team.TeamOption[] }>(() =>
    getTeamAll(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/** Create team */
export function fetchCreateTeam(data: Api.Team.TeamPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    postTeam(
      buildGeneratedOptions(
        {
          body: data
        },
        config
      )
    )
  );
}

/** Update team */
export function fetchUpdateTeam(id: number, data: Api.Team.TeamPayload, config?: CustomAxiosRequestConfig) {
  return callGenerated<unknown>(() =>
    putTeamById(
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

/** Delete team */
export function fetchDeleteTeam(id: number) {
  return callGenerated<unknown>(() =>
    deleteTeamById(
      buildGeneratedOptions({
        path: { id }
      })
    )
  );
}
