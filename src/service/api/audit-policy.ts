import { request } from '../request';

/**
 * Get global audit policy list
 */
export function fetchGetAuditPolicyList() {
  return request<Api.AuditPolicy.ListResponse>({
    url: '/audit/policy/list'
  });
}

/**
 * Get global audit policy history
 *
 * @param params Query params
 */
export function fetchGetAuditPolicyHistory(params: Api.AuditPolicy.HistoryParams) {
  return request<Api.AuditPolicy.HistoryResponse>({
    url: '/audit/policy/history',
    params
  });
}

/**
 * Update global audit policy
 *
 * @param data Payload
 */
export function fetchUpdateAuditPolicy(data: Api.AuditPolicy.UpdatePayload) {
  return request<Api.AuditPolicy.UpdateResponse>({
    url: '/audit/policy',
    method: 'put',
    data
  });
}
