<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getAuditLogDataApi } from "@/api/monitor/auditLog"
import { type GetAuditLogData } from "@/api/monitor/auditLog/types/auditLog"
import { type FormInstance } from "element-plus"
import { Search, Refresh, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import dayjs from "dayjs"

defineOptions({
  // 命名当前组件
  name: "AuditLog"
})

//#region 查

const now = new Date()
const defaultStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
const defaultEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0)
const timeRange = ref<[Date, Date]>([defaultStartTime, defaultEndTime])
const AuditLogData = ref<GetAuditLogData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  traceId: "",
  userName: "",
  ip: "",
  path: "",
  method: "",
  timeRange: timeRange
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const shortcuts = [
  {
    text: "Last week",
    value: () => {
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0)
      startTime.setTime(startTime.getTime() - 3600 * 1000 * 24 * 7)
      return [startTime, endTime]
    }
  },
  {
    text: "Last month",
    value: () => {
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0)
      startTime.setTime(startTime.getTime() - 3600 * 1000 * 24 * 30)
      return [startTime, endTime]
    }
  },
  {
    text: "Last 3 months",
    value: () => {
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0)
      startTime.setTime(startTime.getTime() - 3600 * 1000 * 24 * 90)
      return [startTime, endTime]
    }
  }
]

const getAuditLogData = () => {
  loading.value = true
  getAuditLogDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    traceId: searchData.traceId || undefined,
    userName: searchData.userName || undefined,
    ip: searchData.ip || undefined,
    path: searchData.path || undefined,
    method: searchData.method || undefined,
    startTime: dayjs(searchData.timeRange[0]).format("YYYY-MM-DD HH:mm:ss"),
    endTime: dayjs(searchData.timeRange[1]).format("YYYY-MM-DD HH:mm:ss")
  })
    .then(({ data }) => {
      paginationData.total = data.total
      AuditLogData.value = data.items
    })
    .catch(() => {
      AuditLogData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getAuditLogData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

// onMounted(() => {})

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getAuditLogData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="traceId" label="TraceId">
          <el-input v-model="searchData.traceId" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="userName" label="用户名">
          <el-input v-model="searchData.userName" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="ip" label="地址">
          <el-input v-model="searchData.ip" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="path" label="路径">
          <el-input v-model="searchData.path" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="method" label="方法">
          <el-input v-model="searchData.method" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="timeRange" label="时间范围">
          <el-date-picker
            v-model="searchData.timeRange"
            type="datetimerange"
            unlink-panels
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="shortcuts"
            size="default"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getAuditLogData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="AuditLogData" border show-overflow-tooltip>
          <el-table-column prop="createAt" label="创建时间" width="200" align="center" />
          <el-table-column prop="traceId" label="traceId" align="center" />
          <el-table-column prop="userName" label="用户名" align="center" />
          <el-table-column prop="ip" label="地址" align="center" />
          <el-table-column prop="path" label="路径" align="center" />
          <el-table-column prop="method" label="方法" align="center" />
          <el-table-column prop="params" label="参数" align="center">
            <template #default="scope">
              {{ scope.row.params ? JSON.stringify(scope.row.params) : "" }}
            </template>
          </el-table-column>
          <el-table-column prop="httpCode" label="状态码" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.httpCode == 200" type="success" effect="plain"> {{ scope.row.httpCode }}</el-tag>
              <el-tag v-else type="danger" effect="plain"> {{ scope.row.httpCode }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="responseTime" label="响应时间(ms)" align="center" />
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
