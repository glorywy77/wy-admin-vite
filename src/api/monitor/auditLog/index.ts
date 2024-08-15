import { request } from "@/utils/service"
import type * as AuditLog from "./types/auditLog"

/** 查 */
export function getAuditLogDataApi(params: AuditLog.GetAuditLogRequestData) {
  return request<AuditLog.GetAuditLogResponseData>({
    url: "auditLog/page",
    method: "get",
    params
  })
}
