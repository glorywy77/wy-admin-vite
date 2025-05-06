<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createApiDataApi, deleteApiDataApi, updateApiDataApi, getApiDataApi, getApiGroupsApi } from "@/api/system/api"
import { type CreateOrUpdateApiRequestData, type GetApiData } from "@/api/system/api/types/api"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"
import { forEach } from "lodash"
defineOptions({
  // 命名当前组件
  name: "SysApi"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 表单提交
const DEFAULT_FORM_DATA: CreateOrUpdateApiRequestData = {
  id: undefined,
  path: "",
  method: "",
  apiGroup: "",
  description: ""
}
const isButtonDisabled = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateApiRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateApiRequestData> = {
  path: [{ required: true, trigger: "blur", message: "请输入路径" }],
  method: [{ required: true, trigger: "blur", message: "请选择方法" }],
  apiGroup: [{ required: true, trigger: "blur", message: "请输入接口组" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createApiDataApi : updateApiDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getApiData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}
const resetForm = () => {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
//#endregion

//#region 增
const handleAdd = () => {
  dialogVisible.value = true
}

//#region 删
const handleDelete = (row: GetApiData) => {
  ElMessageBox.confirm(`正在删除：${row.path} ${row.method} ${row.apiGroup}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteApiDataApi({ path: row.path, method: row.method }).then(() => {
      ElMessage.success("删除成功")
      getApiData()
    })
  })
}

// 批量删除
const mutipleSelection = ref<GetApiData[]>([])

const handleSelectionChange = (val: GetApiData[]) => {
  mutipleSelection.value = val
  if (val.length > 0) {
    isButtonDisabled.value = false
  }
  if (val.length === 0) {
    isButtonDisabled.value = true
  }
}
const handleBatchDelete = async (mutipleSelection?: GetApiData[]) => {
  if (mutipleSelection) {
    // 首先确认是否真的要删除
    const confirmResult = await ElMessageBox.confirm(
      `正在删除选中的${mutipleSelection.length}个接口，确认删除？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    if (confirmResult === "confirm") {
      const deletePromises = mutipleSelection.map((row) => {
        return deleteApiDataApi({ path: row.path, method: row.method })
      })

      try {
        await Promise.all(deletePromises)
        ElMessage.success("删除成功")
      } catch (error) {
        console.error("批量删除时发生错误", error)
        ElMessage.error("删除失败，请检查网络或稍后重试")
      }
      getApiData()
    }
  }
}
//#endregion

//#region 改
const handleUpdate = (row: GetApiData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}

//#endregion

//#region 查
const ApiData = ref<GetApiData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  path: "",
  method: "",
  apiGroup: ""
})

const getApiData = () => {
  loading.value = true
  getApiDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    path: searchData.path || undefined,
    method: searchData.method || undefined,
    apiGroup: searchData.apiGroup || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      ApiData.value = data.items
    })
    .catch(() => {
      ApiData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const ApiGroups = ref<Array<string>>([])
const apiGroupSelect = () => {
  getApiGroupsApi()
    .then(({ data }) => {
      forEach(data.items, (item) => {
        if (!ApiGroups.value.includes(item.apiGroup)) {
          ApiGroups.value.push(item.apiGroup)
        }
      })
    })
    .catch(() => {
      ApiData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getApiData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getApiData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="path" label="路径">
          <el-input v-model="searchData.path" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="method" label="方法">
          <el-input v-model="searchData.method" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="apiGroup" label="接口组">
          <el-select
            v-model="searchData.apiGroup"
            filterable
            allow-create
            placeholder="请选择接口组"
            style="width: 240px"
            @click="apiGroupSelect"
          >
            <el-option v-for="item in ApiGroups" :key="item" :label="item" :value="item" />
          </el-select>
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
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">新增接口</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleBatchDelete(mutipleSelection)"
            :disabled="isButtonDisabled"
            >批量删除</el-button
          >
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getApiData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="ApiData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="path" label="路径" align="left" />
          <el-table-column prop="method" label="方法" align="center" />
          <el-table-column prop="apiGroup" label="接口组" align="center" />
          <el-table-column prop="description" label="描述" align="center" />
          <el-table-column prop="createAt" label="创建时间" align="center" />
          <el-table-column prop="updateAt" label="更新时间" align="center" />
          <el-table-column fixed="right" label="操作" width="180" align="center">
            <template #default="scope">
              <el-button type="primary" text icon="Edit" bg size="small" @click="handleUpdate(scope.row)"
                >编辑</el-button
              >
              <el-button type="danger" text icon="Delete" bg size="small" @click="handleDelete(scope.row)"
                >删除</el-button
              >
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
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增接口' : '修改接口'"
      @closed="resetForm"
      width="33%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item prop="path" label="路径">
          <el-input v-model="formData.path" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="method" label="方法">
          <el-select v-model="formData.method" placeholder="选择方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item prop="apiGroup" label="接口组">
          <el-select
            v-model="formData.apiGroup"
            filterable
            allow-create
            placeholder="请选择接口组"
            style="width: 240px"
          >
            <el-option v-for="item in ApiGroups" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item prop="description" label="描述">
          <el-input v-model="formData.description" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>
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
  justify-content: space-between;
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
