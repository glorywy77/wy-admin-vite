import { request } from "@/utils/service"
import type * as Git from "./types/git"

export function getGitBranchOrTagApi(params: Git.GetGitBranchesRequestData) {
  return request<Git.GetGitBranchesResponseData>({
    url: "/git_branch/list",
    method: "get",
    params
  })
}
