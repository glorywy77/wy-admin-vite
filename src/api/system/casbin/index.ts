import { request } from "@/utils/service"
import type * as Casbin from "./types/casbin"

/** 增 */
export function createCasbinRuleDataApi(data: Casbin.CreateOrUpdateCasbinRuleRequestData) {
  return request({
    url: "casbin-rule/save",
    method: "post",
    data
  })
}

/** 删 */
export function deleteCasbinRuleDataApi(data: { id: number }) {
  return request({
    url: "casbin-rule/delete",
    method: "delete",
    data
  })
}

/** 改 */
export function updateCasbinRuleDataApi(data: Casbin.CreateOrUpdateCasbinRuleRequestData) {
  return request({
    url: "casbin-rule/save",
    method: "put",
    data
  })
}

/** 查 */
export function getCasbinRuleDataApi(params: Casbin.GetCasbinRuleRequestData) {
  return request<Casbin.GetCasbinRuleResponseData>({
    url: "casbin-rule/page",
    method: "get",
    params
  })
}
