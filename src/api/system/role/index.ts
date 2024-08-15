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
export function deleteRoleDataApi(data: { roleName: string }) {
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

//查询用户拥有的接口
export function getRoleHasApisDataApi(params: role.CreateOrUpdateRoleRequestData) {
  return request<role.GetRoleHasApisResponseData>({
    url: "sysRole/hasApis",
    method: "get",
    params
  })
}

//以树形结构返回所有可分配的接口
export function getRoleAllApisDataApi() {
  return request<role.GetRoleAllApisResponseData>({
    url: "sysRole/allApis",
    method: "get"
  })
}

//查询用户列表
export function getRoleListApi() {
  return request<role.GetRoleResponseData>({
    url: "sysRole/list",
    method: "get"
  })
}
