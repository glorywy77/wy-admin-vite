export interface CreateOrUpdateRoleRequestData {
  id?: number
  role: string
  description?: string
}

export interface GetRoleRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number

  role?: string
}

export interface GetRoleData {
  id: number
  role: string
  description?: string
}

export type GetRoleResponseData = ApiResponseData<{
  total: number
  items: GetRoleData[]
}>
