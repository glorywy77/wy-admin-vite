export interface LoginRequestData {
  /** admin 或 editor */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code: string
}

export type LoginCodeResponseData = ApiResponseData<{ captchaSrc: ArrayBuffer }>

// export type CaptchaResponseData = ApiResponseData<{ captchaSrc: ArrayBuffer }>

export type LoginResponseData = ApiResponseData<{ token: string; expire: string }>

// export type UserInfoResponseData = ApiResponseData<{ username: string; roles: string[] }>
export type UserInfoResponseData = ApiResponseData<{
  userid: string
  identity_key: string
  payload: {
    exp: number
    id: number
    userid: string
    orig_iat: number
    roles: string[]
    username: string
    enable: number
    email: string
    create_at: string
  }
}>
