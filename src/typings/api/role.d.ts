declare namespace Api {
  /**
   * namespace Role
   *
   * backend api module: "role"
   */
  namespace Role {
    interface RoleRecord {
      id: number;
      roleCode: string;
      roleName: string;
      tenantId: string;
      tenantName: string;
      description: string;
      status: Api.Common.EnableStatus;
      level?: number;
      manageable?: boolean;
      userCount: number;
      permissionCodes: string[];
      createTime: string;
      updateTime: string;
    }

    interface RoleListParams {
      current: number;
      size: number;
      keyword?: string;
      status?: Api.Common.EnableStatus;
      level?: number;
    }

    interface RolePayload {
      roleCode: string;
      roleName: string;
      level: number;
      description?: string;
      status?: Api.Common.EnableStatus;
      permissionCodes?: string[];
    }

    interface RoleOption {
      id: number;
      roleCode: string;
      roleName: string;
      level?: number;
      manageable?: boolean;
    }

    type RoleList = Api.Common.PaginatingQueryRecord<RoleRecord> & {
      actorLevel?: number;
    };
  }
}
