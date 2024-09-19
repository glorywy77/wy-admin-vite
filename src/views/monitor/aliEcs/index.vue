<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue"
import { getAliEcsDataApi } from "@/api/monitor/aliEcs"
import { type GetAliEcsData } from "@/api/monitor/aliEcs/types/aliEcs"
import { type FormInstance } from "element-plus"
import { Search, Refresh, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"

defineOptions({
  // 命名当前组件
  name: "AliEcs"
})

//#region 查

const AliEcsData = ref<GetAliEcsData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  RegionId: "cn-zhangjiakou",
  DynamicSelectKey: "InstanceName",
  DynamicSelectValue: ""
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//自定义筛选项

// 计算属性，根据 select 的值动态生成 placeholder
const dynamicPlaceholder = computed(() => {
  switch (searchData.DynamicSelectKey) {
    case "PublicIpAddresses":
      return "支持多ip逗号分隔"
    case "PrivateIpAddresses":
      return "支持多ip逗号分隔"
    case "InstanceName":
      return "支持加*模糊查询"
    default:
      return "请输入"
  }
})

const getAliEcsData = () => {
  loading.value = true
  getAliEcsDataApi({
    CurrentPage: paginationData.currentPage,
    PageSize: paginationData.pageSize,
    RegionId: searchData.RegionId || undefined,
    DynamicSelectKey: searchData.DynamicSelectKey || undefined,
    DynamicSelectValue: searchData.DynamicSelectValue || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.Total
      AliEcsData.value = data.Instance
    })
    .catch(() => {
      AliEcsData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const formatUtcToCst = (utcTime: string) => {
  const date = new Date(utcTime)
  date.setHours(date.getHours() + 8) // 加上 8 小时
  return date.toISOString().substring(0, 19).replace("T", " ")
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getAliEcsData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getAliEcsData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="RegionId" label="地域">
          <el-select v-model="searchData.RegionId" placeholder="请选择地域">
            <el-option label="cn-zhangjiakou" value="cn-zhangjiakou" />
          </el-select>
        </el-form-item>

        <!-- 在 Element UI 的 el-form 和 el-form-item 组件中，prop 属性的作用是定义表单项与表单验证规则之间的关联。它是表单验证系统用来识别哪个表单项对应于哪个验证规则的关键标识。
            具体来说，prop 属性有以下几个主要作用：
            1.验证关联：当你定义表单验证规则时，需要指定每个规则对应哪个表单项。prop 属性就是用来标识这个关系的。当你使用 el-form-item 的 prop 属性时，它会告诉表单验证系统这个表单项对应于哪个字段。
            2.错误信息提示：在表单验证失败时，Element UI 会根据 prop 属性显示对应的错误信息。如果你没有设置 prop 属性，那么即使表单项的值不符合验证规则，也不会显示出错信息。
            3.重置表单：当你调用 el-form 的 resetFields 方法时，prop 属性用于标识哪些表单项需要被重置。resetFields 方法会根据 prop 属性将对应的表单项重置为其初始状态。 -->
        <el-form-item prop="DynamicSelectValue" label="动态筛选">
          <el-input
            v-model="searchData.DynamicSelectValue"
            :placeholder="dynamicPlaceholder"
            class="input-with-select"
            style="width: 500px"
          >
            <template #prepend>
              <el-select v-model="searchData.DynamicSelectKey" placeholder="请选择筛选项">
                <el-option label="公网IP" value="PublicIpAddresses" />
                <el-option label="私网IP" value="PrivateIpAddresses" />
                <el-option label="实例名称" value="InstanceName" />
              </el-select>
            </template>
          </el-input>
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
            <el-button type="primary" :icon="RefreshRight" circle @click="getAliEcsData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="AliEcsData" border show-overflow-tooltip>
          <el-table-column prop="InstanceName" label="实例名称" align="center" />

          <el-table-column prop="InstanceId" label="实例ID" align="center" />

          <el-table-column prop="publicIpAddress,VpcAttributes" label="IP" align="center" width="150">
            <template #default="scope">
              {{ scope.row.PublicIpAddress.IpAddress ? "公:" + scope.row.PublicIpAddress.IpAddress[0] : "" }}
              {{
                scope.row.VpcAttributes.PrivateIpAddress.IpAddress
                  ? "私:" + scope.row.VpcAttributes.PrivateIpAddress.IpAddress[0]
                  : ""
              }}
            </template>
          </el-table-column>

          <el-table-column prop="Cpu" label="CPU" align="center" width="80">
            <template #default="scope">
              {{ scope.row.Cpu + "核" }}
            </template>
          </el-table-column>

          <el-table-column prop="Memory" label="内存" align="center" width="80">
            <template #default="scope">
              {{ scope.row.Memory / 1024 + "GB" }}
            </template>
          </el-table-column>

          <el-table-column prop="OSName" label="操作系统" align="center" />

          <el-table-column prop="ZoneId" label="可用区" align="center" width="80">
            <template #default="scope">
              {{ scope.row.ZoneId.replaceAll("cn-zhangjiakou-", "") }}
            </template>
          </el-table-column>

          <el-table-column prop="CreationTime" label="创建时间" align="center">
            <template #default="scope">
              {{ formatUtcToCst(scope.row.CreationTime) }}
            </template>
          </el-table-column>

          <el-table-column prop="ExpiredTime" label="到期时间" align="center">
            <template #default="scope">
              {{ formatUtcToCst(scope.row.ExpiredTime) }}
            </template>
          </el-table-column>

          <el-table-column prop="Status" label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.Status == 'Running'" type="success" effect="plain">
                {{ scope.row.Status }}</el-tag
              >
              <el-tag v-else type="danger" effect="plain"> {{ scope.row.Status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :CurrentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  .el-select {
    --el-select-width: 200px;
  }
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

.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
</style>
