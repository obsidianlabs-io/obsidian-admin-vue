import { getAuditPolicyHistory, getAuditPolicyList, putAuditPolicy } from './generated';
import { buildGeneratedOptions, callGenerated } from './generated-adapter';

/**
 * Get global audit policy list
 */
export function fetchGetAuditPolicyList() {
  return callGenerated<Api.AuditPolicy.ListResponse>(() => getAuditPolicyList());
}

/**
 * Get global audit policy history
 *
 * @param params Query params
 */
export function fetchGetAuditPolicyHistory(params: Api.AuditPolicy.HistoryParams) {
  return callGenerated<Api.AuditPolicy.HistoryResponse>(() =>
    getAuditPolicyHistory(
      buildGeneratedOptions({
        query: params
      })
    )
  );
}

/**
 * Update global audit policy
 *
 * @param data Payload
 */
export function fetchUpdateAuditPolicy(data: Api.AuditPolicy.UpdatePayload) {
  return callGenerated<Api.AuditPolicy.UpdateResponse>(() =>
    putAuditPolicy(
      buildGeneratedOptions({
        body: data
      })
    )
  );
}
