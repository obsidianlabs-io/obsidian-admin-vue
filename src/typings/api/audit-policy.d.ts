declare namespace Api {
  /**
   * namespace AuditPolicy
   *
   * backend api module: "audit/policy"
   */
  namespace AuditPolicy {
    interface PolicyRecord {
      action: string;
      category: 'mandatory' | 'optional';
      mandatory: boolean;
      locked: boolean;
      lockReason: string;
      description: string;
      enabled: boolean;
      samplingRate: number;
      retentionDays: number;
      source: 'default' | 'platform' | 'tenant';
      defaultEnabled: boolean;
      defaultSamplingRate: number;
      defaultRetentionDays: number;
    }

    interface ListResponse {
      records: PolicyRecord[];
    }

    interface UpdatePayload {
      records: Array<{
        action: string;
        enabled: boolean;
        samplingRate?: number;
        retentionDays?: number;
      }>;
      changeReason: string;
    }

    interface UpdateResponse {
      updated: number;
      revisionId: string;
      clearedTenantOverrides?: number;
      records: PolicyRecord[];
    }

    interface HistoryParams {
      current: number;
      size: number;
    }

    interface RevisionRecord {
      id: string;
      scope: string;
      changedByUserId: string;
      changedByUserName: string;
      changeReason: string;
      changedCount: number;
      changedActions: string[];
      createdAt: string;
    }

    type HistoryResponse = Api.Common.PaginatingQueryRecord<RevisionRecord>;
  }
}
