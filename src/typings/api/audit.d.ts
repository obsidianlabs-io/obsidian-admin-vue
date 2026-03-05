declare namespace Api {
  /**
   * namespace Audit
   *
   * backend api module: "audit"
   */
  namespace Audit {
    type AuditLogType = 'login' | 'api' | 'operation' | 'data' | 'permission';

    interface AuditLogRecord {
      id: number;
      action: string;
      logType: AuditLogType;
      userName: string;
      tenantId: string;
      tenantName: string;
      auditableType: string;
      auditableId: string;
      target: string;
      oldValues: Record<string, unknown>;
      newValues: Record<string, unknown>;
      ipAddress: string;
      userAgent: string;
      createTime: string;
    }

    interface AuditLogListParams {
      current: number;
      size: number;
      keyword?: string;
      action?: string;
      logType?: AuditLogType;
      userName?: string;
      dateFrom?: string;
      dateTo?: string;
    }

    type AuditLogList = Api.Common.PaginatingQueryRecord<AuditLogRecord>;
  }
}
