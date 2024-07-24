export interface CreateOrUpdateUserRequestData {
  id?: number
  userid?: string
  username?: string
  password?: string
  confirmPassword?: string
  email?: string
  roles?: string[]
  enable?: number
  remark?: string
}

export interface GetUserRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number
  /** 查询参数：用户名 */
  username?: string

  email?: string
}

export interface GetUserData {
  id: number
  userid: string
  username: string
  email: string
  roles: string[]
  enable: number
  create_at: string
  update_at: string
  remark: string
}

export type GetUserResponseData = ApiResponseData<{
  total: number
  items: GetUserData[]
}>

export interface DeleteUserData {
  id: number
  username: string
}
