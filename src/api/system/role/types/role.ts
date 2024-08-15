//增加或修改角色
export interface CreateOrUpdateRoleRequestData {
  id?: number
  roleName?: string
  description?: string
  hasApis?: number[]
}

//分页返回角色
export interface GetRoleRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number

  roleName?: string
}

export interface GetRoleData {
  id: number
  roleName: string
  description?: string
}

export type GetRoleResponseData = ApiResponseData<{
  total: number
  items: GetRoleData[]
}>

//查询所有的api接口
export type GetRoleAllApisResponseData = ApiResponseData<{
  allApis: {
    treeData: {
      // ParentData
      label: string
      children: {
        // ChildData[]
        id: string
        label: string
      }[]
    }[]
  }
}>

export type GetRoleHasApisResponseData = ApiResponseData<{
  hasApis: {
    apiKeys: number[]
  }
}>
