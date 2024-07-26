export interface CreateOrUpdateApiRequestData {
  id?: number
  path?: string
  method?: string
  apiGroup?: string
  description?: string
  createAt?: string
  updateAt?: string
}

export interface GetApiRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number

  path?: string
  method?: string
  apiGroup?: string
}

export interface GetApiData {
  id: number
  path: string
  method: string
  apiGroup: string
  description: string
  createAt: string
  updateAt: string
}

export type GetApiResponseData = ApiResponseData<{
  total: number
  items: GetApiData[]
}>
