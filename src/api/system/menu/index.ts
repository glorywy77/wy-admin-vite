import { request } from "@/utils/service"
import type * as Menu from "./types/menu"

/** 增 */
export function createMenuDataApi(data: Menu.CreateOrUpdateMenuRequestData) {
  return request({
    url: "sysMenu/save",
    method: "post",
    data
  })
}

/** 删 */
export function deleteMenuDataApi(data: { id: number }) {
  return request({
    url: "sysMenu/delete",
    method: "delete",
    data
  })
}

/** 改 */
export function updateMenuDataApi(data: Menu.CreateOrUpdateMenuRequestData) {
  return request({
    url: "sysMenu/save",
    method: "put",
    data
  })
}

/** 查 */
export function getMenuDataApi(params: Menu.GetMenuRequestData) {
  return request<Menu.GetMenuResponseData>({
    url: "sysMenu/page",
    method: "get",
    params
  })
}

export function getParentMenusApi() {
  return request<Menu.GetMenuResponseData>({
    url: "sysMenu/parentMenu",
    method: "get"
  })
}
