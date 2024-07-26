import { request } from "@/utils/service"
import type * as role from "./types/role"

/** 增 */
export function createRoleDataApi(data: role.CreateOrUpdateRoleRequestData) {
  return request({
    url: "sysRole/save",
    method: "post",
    data
  })
}

/** 删 */
export function deleteRoleDataApi(data: { id: number }) {
  return request({
    url: "sysRole/delete",
    method: "delete",
    data
  })
}

/** 改 */
export function updateRoleDataApi(data: role.CreateOrUpdateRoleRequestData) {
  return request({
    url: "sysRole/save",
    method: "put",
    data
  })
}

/** 查 */
export function getRoleDataApi(params: role.GetRoleRequestData) {
  return request<role.GetRoleResponseData>({
    url: "sysRole/page",
    method: "get",
    params
  })
}
