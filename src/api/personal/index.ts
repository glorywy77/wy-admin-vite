import { request } from "@/utils/service"
import type * as Personal from "./types/personal"

/** 改 */
export function updateUserDataApi(data: Personal.CreateOrUpdateUserRequestData) {
  return request({
    url: "personal/update",
    method: "put",
    data
  })
}

export function resetUserPassApi(data: Personal.CreateOrUpdateUserRequestData) {
  return request({
    url: `personal/resetPass`,
    method: "put",
    data
  })
}

//查
export function getUserDataApi(params: { username: string }) {
  return request<Personal.GetUserResponseData>({
    url: "personal/get",
    method: "get",
    params
  })
}
