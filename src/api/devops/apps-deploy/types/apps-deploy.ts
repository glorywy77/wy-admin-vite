//cicd提交
export interface CiOrCdSumbitRequestData {
  serviceName: string
  serviceId: number
  serviceSpace: string
  branchOrTag?: string
  gitMsg?: any
  deployer?: string
  deployType?: number
  onlyCi?: boolean
  forceBuild?: boolean
  image?: string
  env?: string
}

//取消流水线
export interface PipelineTerminateRequestData {
  uid: string
  ciPipelineName?: string
  cdPipelineName?: string
}

//分页查询应用部署页面
export interface GetAppsDeployPageRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  pageSize: number
  serviceName?: string
  serviceSpace?: string
  env?: string
}

export interface GetAppsDeployData {
  uid: string
  serviceId: number
  serviceName: string
  serviceSpace: string
  deployType?: number
  deployResult?: number
  deployStages?: number[]
  gitMsg?: {
    branch: string
    commitDateTime: string
    commitEmail: string
    commitId: string
    commitMsg: string
    isTag: boolean
  }
  deployer?: string
  env: string
  image?: string
  createAt?: string
  ciPipelineName?: string
  cdPipelineName?: string
}

export type GetAppsDeployPageResponseData = ApiResponseData<{
  total: number
  items: GetAppsDeployData[]
}>

//单个应用部署历史记录查询
export interface GetAppsDeployQueryRequestData {
  serviceId?: number
  env?: string
  count?: number
}

export interface GetAppsDeployQueryData {
  serviceName?: string
  serviceSpace?: string
  deployType?: number
  deployResult?: number
  deployStages?: number[]
  gitMsg?: any
  deployer?: string
  env?: string
  image?: string
  createAt?: string
}

export type GetAppsDeployQueryResponseData = ApiResponseData<{
  items: GetAppsDeployQueryData[]
}>

//查询历史镜像
export interface GetImagesQueryRequestData {
  serviceId?: number
  branchOrTag?: string
  env?: string
  count?: number
}

export interface GetImagesQueryData {
  serviceId?: string
  gitMsg?: {
    branch: string
    commitDateTime: string
    commitEmail: string
    commitId: string
    commitMsg: string
    isTag: boolean
  }
  image?: string
}

export type GetImagesQueryResponseData = ApiResponseData<{
  items: GetImagesQueryData[]
}>
