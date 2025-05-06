export interface CreateOrUpdateAppsRequestData {
  id?: number
  serviceName?: string
  k8sCluster?: string
  serviceSpace?: string
  nameSpace?: string
  codeRepository?: string
  labels?: any
  env?: string[]
  createAt?: string
  updateAt?: string
}

export interface GetAppsRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number
  labels?: any
  env?: string[]
  serviceName?: string
  k8sCluster?: string
  serviceSpace?: string
  nameSpace?: string
  codeRepository?: string
}

export interface GetAppsData {
  id: number
  serviceName: string
  k8sCluster?: string
  serviceSpace: string
  nameSpace: string
  codeRepository: string
  labels?: any
  env?: string[]
  createAt: string
  updateAt: string
}

export type GetAppsResponseData = ApiResponseData<{
  total: number
  items: GetAppsData[]
}>
