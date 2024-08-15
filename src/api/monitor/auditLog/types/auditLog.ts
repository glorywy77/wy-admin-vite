export interface GetAuditLogRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number
  traceId?: string
  userName?: string
  ip?: string
  path?: string
  method?: string
  startTime: string
  endTime: string
}

export interface GetAuditLogData {
  id: number
  traceId: string
  userName: string
  ip: string
  path: string
  method: string
  params: string
  httpCode: number
  responseTime: number
  createAt: string
}

export type GetAuditLogResponseData = ApiResponseData<{
  total: number
  items: GetAuditLogData[]
}>
