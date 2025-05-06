import { request } from "@/utils/service"
import type * as AppsDeploy from "./types/apps-deploy"

// CI 持续集成提交
export function ciSumbitApi(data: AppsDeploy.CiOrCdSumbitRequestData) {
  return request({
    url: "/appsDeploy/ciSubmit",
    method: "post",
    data
  })
}

// CD 持续部署提交
export function cdSumbitApi(data: AppsDeploy.CiOrCdSumbitRequestData) {
  return request({
    url: "/appsDeploy/cdSubmit",
    method: "post",
    data
  })
}

// 取消流水线
export function pipelineTerminateApi(data: AppsDeploy.PipelineTerminateRequestData) {
  return request({
    url: "/appsDeploy/pipelineTerminate",
    method: "post",
    data
  })
}

// 分页查询应用部署
export function getAppsDeployPageApi(params: AppsDeploy.GetAppsDeployPageRequestData) {
  return request<AppsDeploy.GetAppsDeployPageResponseData>({
    url: "/appsDeploy/page",
    method: "get",
    params
  })
}

// 查询单个应用部署历史
export function getAppsDeployQueryApi(params: AppsDeploy.GetAppsDeployQueryRequestData) {
  return request<AppsDeploy.GetAppsDeployQueryResponseData>({
    url: "/appsDeploy/query",
    method: "get",
    params
  })
}

// 查询历史部署镜像
export function getImagesQueryApi(params: AppsDeploy.GetImagesQueryRequestData) {
  return request<AppsDeploy.GetImagesQueryResponseData>({
    url: "/appsDeploy/imagesQuery",
    method: "get",
    params
  })
}
