//服务Git分支查询
export interface GetGitBranchesRequestData {
  serviceId?: number
}

export interface GetGitBranchesData {
  isTag: boolean
  branch: string
  commitDateTime: string
  commitEmail: string
  commitId: string
  commitMsg: string
}

export type GetGitBranchesResponseData = ApiResponseData<{
  items: GetGitBranchesData[]
}>
