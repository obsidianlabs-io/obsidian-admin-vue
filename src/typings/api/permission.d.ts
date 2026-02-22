declare namespace Api {
  /**
   * namespace Permission
   *
   * backend api module: "permission"
   */
  namespace Permission {
    interface PermissionRecord {
      id: number;
      permissionCode: string;
      permissionName: string;
      group: string;
      description: string;
      status: Api.Common.EnableStatus;
      roleCount: number;
      createTime: string;
      updateTime: string;
    }

    interface PermissionListParams {
      current: number;
      size: number;
      keyword?: string;
      status?: Api.Common.EnableStatus;
      group?: string;
    }

    interface PermissionPayload {
      permissionCode: string;
      permissionName: string;
      group?: string;
      description?: string;
      status?: Api.Common.EnableStatus;
    }

    interface PermissionOption {
      id: number;
      permissionCode: string;
      permissionName: string;
      group: string;
    }

    type PermissionList = Api.Common.PaginatingQueryRecord<PermissionRecord>;
  }
}
