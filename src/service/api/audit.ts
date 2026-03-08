import { getAuditList } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get audit log list
 *
 * @param params Query params
 */
export function fetchGetAuditLogList(params: Api.Audit.AuditLogListParams) {
  return callGenerated<Api.Audit.AuditLogList>(() =>
    getAuditList(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}
