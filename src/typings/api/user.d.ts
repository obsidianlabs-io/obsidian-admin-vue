declare namespace Api {
  /**
   * namespace User
   *
   * backend api module: "user"
   */
  namespace User {
    interface UserRecord {
      id: number;
      userName: string;
      email: string;
      roleCode?: string | null;
      roleName?: string | null;
      roleLevel?: number;
      status: Api.Common.EnableStatus;
      manageable?: boolean;
      createTime: string;
      updateTime: string;
    }

    interface UserListParams {
      current: number;
      size: number;
      keyword?: string;
      status?: Api.Common.EnableStatus;
      userName?: string;
      userEmail?: string;
      roleCode?: string;
    }

    interface UserPayload {
      userName: string;
      email: string;
      roleCode: string;
      status: Api.Common.EnableStatus;
      password?: string;
    }

    type UserList = Api.Common.PaginatingQueryRecord<UserRecord> & {
      actorLevel?: number;
    };
  }
}
