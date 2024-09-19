export interface GetAliEcsRequestData {
  /** 当前页码 */
  CurrentPage: number
  /** 查询条数 */
  PageSize: number
  RegionId?: string
  DynamicSelectKey?: string
  DynamicSelectValue?: string
}

export interface GetAliEcsData {
  InstanceName: string
  InstanceId: string
  OSName: string
  Cpu: number
  Memory: number

  PublicIpAddress: {
    IpAddress: string[]
  }
  VpcAttributes: {
    PrivateIpAddress: {
      IpAddress: [string[]]
    }
  }

  Status: string
  ZoneId: string
  CreationTime: string
  ExpiredTime: string
}

export type GetAliEcsResponseData = ApiResponseData<{
  Total: number
  Instance: GetAliEcsData[]
}>
