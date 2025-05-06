import { request } from "@/utils/service"
import type * as Apps from "./types/apps"

/** 增 */
export function createAppsDataApi(data: Apps.CreateOrUpdateAppsRequestData) {
  return request({
    url: "apps/save",
    method: "post",
    data
  })
}

/** 删 */
export function deleteAppsDataApi(data: { id: number }) {
  return request({
    url: "apps/delete",
    method: "delete",
    data
  })
}

/** 改 */
export function updateAppsDataApi(data: Apps.CreateOrUpdateAppsRequestData) {
  return request({
    url: "apps/save",
    method: "put",
    data
  })
}

/** 查 */
export function getAppsDataApi(params: Apps.GetAppsRequestData) {
  return request<Apps.GetAppsResponseData>({
    url: "apps/page",
    method: "get",
    params
  })
}
