import { request } from "@/utils/service"
import type * as User from "./types/user"

/** 增 */
export function createUserDataApi(data: User.CreateOrUpdateUserRequestData) {
  return request({
    url: "user/create",
    method: "post",
    data
  })
}

/** 删 */
export function deleteUserDataApi(id: string) {
  return request({
    url: `user/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateUserDataApi(data: User.CreateOrUpdateUserRequestData) {
  return request({
    url: "user/update",
    method: "put",
    data
  })
}

export function resetUserPassApi(data: User.CreateOrUpdateUserRequestData) {
  return request({
    url: `user/resetPass`,
    method: "put",
    data
  })
}

/** 查 */
export function getUserDataApi(params: User.GetUserRequestData) {
  return request<User.GetUserResponseData>({
    url: "user/page",
    method: "post",
    params
  })
}
