import { request } from "@/utils/service"
import type * as User from "./types/user"

/** 增 */
export function createUserDataApi(data: User.CreateOrUpdateUserRequestData) {
  return request({
    url: "sysUser/create",
    method: "post",
    data
  })
}

/** 删 */
export function deleteUserDataApi(data: User.DeleteUserData) {
  return request({
    url: `sysUser/delete`,
    method: "delete",
    data
  })
}

/** 改 */
export function updateUserDataApi(data: User.CreateOrUpdateUserRequestData) {
  return request({
    url: "sysUser/update",
    method: "put",
    data
  })
}

export function resetUserPassApi(data: User.CreateOrUpdateUserRequestData) {
  return request({
    url: `sysUser/resetPass`,
    method: "put",
    data
  })
}

/** 查 */
export function getUserDataApi(params: User.GetUserRequestData) {
  return request<User.GetUserResponseData>({
    url: "sysUser/page",
    method: "get",
    params
  })
}

/** 强制下线 */
export function offineUserApi(data: { id: number; username: string }) {
  return request({
    url: "sysUser/offine",
    method: "post",
    data
  })
}
