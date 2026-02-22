declare namespace Api {
  /**
   * namespace Audit
   *
   * backend api module: "audit"
   */
  namespace Audit {
    interface AuditLogRecord {
      id: number;
      action: string;
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
      userName?: string;
      dateFrom?: string;
      dateTo?: string;
    }

    type AuditLogList = Api.Common.PaginatingQueryRecord<AuditLogRecord>;
  }
}
