export interface CreateOrUpdateCasbinRuleRequestData {
  id?: number
  p_type?: string
  v0?: string
  v1?: string
  v2?: string
  v3?: string
  v4?: string
  v5?: string
  summary?: string
}

export interface GetCasbinRuleRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number

  v0?: string

  v1?: string

  v2?: string
}

export interface GetCasbinRuleData {
  id: number
  p_type: string
  v0: string
  v1: string
  v2: string
  V3: string
  v4: string
  v5: string
  summary?: string
}

export type GetCasbinRuleResponseData = ApiResponseData<{
  total: number
  items: GetCasbinRuleData[]
}>
