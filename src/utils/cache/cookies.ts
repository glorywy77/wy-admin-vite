/** 统一处理 Cookie */

import CacheKey from "@/constants/cache-key"
import Cookies from "js-cookie"

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token)
}
export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN)
}

//添加session相关的内容
// export const setGfsessionid = (gfsessionid: string) => {
//   Cookies.set("gfsessionid", gfsessionid)
//   return
// }

// export const getGfsessionid = () => {
//   return Cookies.get("gfsessionid")
// }
