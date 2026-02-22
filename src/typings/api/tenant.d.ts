declare namespace Api {
  /**
   * namespace Tenant
   *
   * backend api module: "tenant"
   */
  namespace Tenant {
    interface TenantRecord {
      id: number;
      tenantCode: string;
      tenantName: string;
      status: Api.Common.EnableStatus;
      userCount: number;
      createTime: string;
      updateTime: string;
    }

    interface TenantListParams {
      current: number;
      size: number;
      keyword?: string;
      status?: Api.Common.EnableStatus;
    }

    type TenantPayload = BackendGenerated.DTO.Tenant.CreateTenantDTO;

    type TenantUpdatePayload = BackendGenerated.DTO.Tenant.UpdateTenantDTO;

    interface TenantOption {
      id: number;
      tenantCode: string;
      tenantName: string;
    }

    type TenantList = Api.Common.PaginatingQueryRecord<TenantRecord>;
  }
}
