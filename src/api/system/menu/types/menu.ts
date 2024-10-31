export interface CreateOrUpdateMenuRequestData {
  id?: number
  title: string
  parent_id?: number
  roles: string[]
  path: string
  component: any
  name: string
  elIcon: string
  keepAlive: number
  sort: number
}

export interface GetMenuRequestData {
  /** 当前页码 */
  currentPage?: number
  /** 查询条数 */
  pageSize?: number
  title?: string
}

export interface GetMenuData {
  id: number
  parent_id: number
  path: string
  component: any
  name: string
  sort: number
  meta: Meta
  children?: GetMenuData[]
}

export interface Meta {
  title: string
  elIcon: string
  roles: string[]
  keepAlive: number
}

export type GetMenuResponseData = ApiResponseData<{
  total: number
  items: GetMenuData[]
}>
