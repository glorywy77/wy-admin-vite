import { request } from "@/utils/service"
import type * as Api from "./types/api"

/** 增 */
export function createApiDataApi(data: Api.CreateOrUpdateApiRequestData) {
  return request({
    url: "sysApi/save",
    method: "post",
    data
  })
}

/** 删 */
export function deleteApiDataApi(data: { path: string; method: string }) {
  return request({
    url: "sysApi/delete",
    method: "delete",
    data
  })
}

/** 改 */
export function updateApiDataApi(data: Api.CreateOrUpdateApiRequestData) {
  return request({
    url: "sysApi/save",
    method: "put",
    data
  })
}

/** 查 */
export function getApiDataApi(params: Api.GetApiRequestData) {
  return request<Api.GetApiResponseData>({
    url: "sysApi/page",
    method: "get",
    params
  })
}

export function getApiGroupsApi() {
  return request<Api.GetApiResponseData>({
    url: "sysApi/groups",
    method: "get"
  })
}
