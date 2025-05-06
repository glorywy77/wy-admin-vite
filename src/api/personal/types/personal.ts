export interface CreateOrUpdateUserRequestData {
  id?: number
  userid?: string
  username?: string
  password?: string
  confirmPassword?: string
  email?: string
  remark?: string
}

export interface GetUserData {
  id: number
  userid: string
  username: string
  email: string
  roles: string[]
  create_at: string
  update_at: string
  remark: string
}

export type GetUserResponseData = ApiResponseData<{
  item: GetUserData
}>
