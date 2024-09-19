import { request } from "@/utils/service"
import type * as AliEcs from "./types/aliEcs"

/** 查 */
export function getAliEcsDataApi(params: AliEcs.GetAliEcsRequestData) {
  return request<AliEcs.GetAliEcsResponseData>({
    url: "aliEcs/page",
    method: "get",
    params
  })
}
