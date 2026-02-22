import { request } from '../request';

/**
 * Get audit log list
 *
 * @param params Query params
 */
export function fetchGetAuditLogList(params: Api.Audit.AuditLogListParams) {
  return request<Api.Audit.AuditLogList>({
    url: '/audit/list',
    params
  });
}
