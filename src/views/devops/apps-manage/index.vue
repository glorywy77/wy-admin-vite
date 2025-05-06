<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createAppsDataApi, deleteAppsDataApi, updateAppsDataApi, getAppsDataApi } from "@/api/devops/apps"
import { type CreateOrUpdateAppsRequestData, type GetAppsData } from "@/api/devops/apps/types/apps"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight, CollectionTag } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "AppsMan"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 表单提交
const DEFAULT_FORM_DATA: CreateOrUpdateAppsRequestData = {
  id: undefined,
  serviceName: "",
  k8sCluster: "",
  serviceSpace: "",
  nameSpace: "",
  codeRepository: "",
  labels: {},
  env: [],
  createAt: "",
  updateAt: ""
}
const isButtonDisabled = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateAppsRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateAppsRequestData> = {
  serviceName: [{ required: true, trigger: "blur", message: "请输入服务名" }],
  k8sCluster: [{ required: true, trigger: "blur", message: "请输入k8s集群" }],
  serviceSpace: [{ required: true, trigger: "blur", message: "请选择项目空间" }],
  nameSpace: [{ required: true, trigger: "blur", message: "请输入命名空间" }],
  codeRepository: [{ required: true, trigger: "blur", message: "请输入代码仓库" }],
  env: [{ required: true, trigger: "blur", message: "请选择环境" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createAppsDataApi : updateAppsDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getAppsData()
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
  newLabelKey.value = ""
  newLabelValue.value = ""
}

//#region 删
const handleDelete = (row: GetAppsData) => {
  ElMessageBox.confirm(`正在删除：${row.serviceName} ，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteAppsDataApi({ id: row.id }).then(() => {
      ElMessage.success("删除成功")
      getAppsData()
    })
  })
}

// 批量删除
const mutipleSelection = ref<GetAppsData[]>([])

const handleSelectionChange = (val: GetAppsData[]) => {
  mutipleSelection.value = val
  if (val.length > 0) {
    isButtonDisabled.value = false
  }
  if (val.length === 0) {
    isButtonDisabled.value = true
  }
}
const handleBatchDelete = async (mutipleSelection?: GetAppsData[]) => {
  if (mutipleSelection) {
    // 首先确认是否真的要删除
    const confirmResult = await ElMessageBox.confirm(
      `正在删除选中的${mutipleSelection.length}个选项，确认删除？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    if (confirmResult === "confirm") {
      const deletePromises = mutipleSelection.map((row) => {
        return deleteAppsDataApi({ id: row.id })
      })

      try {
        await Promise.all(deletePromises)
        ElMessage.success("删除成功")
      } catch (error) {
        console.error("批量删除时发生错误", error)
        ElMessage.error("删除失败，请检查网络或稍后重试")
      }
      getAppsData()
    }
  }
}
//#endregion

//#region 改
const handleUpdate = (row: GetAppsData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
  newLabelKey.value = ""
  newLabelValue.value = ""
}

//#endregion

//#region 查
const AppsData = ref<GetAppsData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  serviceName: "",
  k8sCluster: "",
  serviceSpace: "",
  nameSpace: "",
  codeRepository: ""
})

const getAppsData = () => {
  loading.value = true
  getAppsDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    serviceName: searchData.serviceName || undefined,
    k8sCluster: searchData.k8sCluster || undefined,
    serviceSpace: searchData.serviceSpace || undefined,
    codeRepository: searchData.codeRepository || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      AppsData.value = data.items
    })
    .catch(() => {
      AppsData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getAppsData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

//关于标签的操作
const newLabelKey = ref("")
const newLabelValue = ref("")
// 定义标签选项的类型
type LabelOption = {
  label: string
  value: string
}

// 新增响应式数据，明确指定类型
const labelValues = ref<LabelOption[]>([])

// 新增方法：查询标签
watch(
  newLabelKey,
  (newKey) => {
    console.log("newKey", newKey)
    if (newKey === "department") {
      labelValues.value = [
        { label: "xsh", value: "xsh" },
        { label: "dc", value: "dc" }
      ]
    } else if (newKey === "business") {
      labelValues.value = [
        { label: "wytest", value: "wytest" },
        { label: "saas", value: "saas" }
      ]
    } else {
      labelValues.value = []
    }
  },
  { immediate: true }
)

// 新增方法：添加标签
const addLabel = () => {
  if (newLabelKey.value && newLabelValue.value) {
    formData.value.labels[newLabelKey.value] = newLabelValue.value
    newLabelKey.value = ""
    newLabelValue.value = ""
  }
}

// 新增方法：删除标签
const removeLabel = (key: string) => {
  delete formData.value.labels[key]
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getAppsData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="serviceName" label="服务名">
          <el-input v-model="searchData.serviceName" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="serviceSpace" label="项目空间">
          <el-input v-model="searchData.serviceSpace" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="codeRepository" label="代码仓库">
          <el-input v-model="searchData.codeRepository" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">新增服务</el-button>
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
            <el-button type="primary" :icon="RefreshRight" circle @click="getAppsData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="AppsData" show-overflow-tooltip @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="id" label="应用id" align="left" />
          <el-table-column prop="serviceName" label="服务名" align="left" />
          <el-table-column prop="k8sCluster" label="k8s集群" align="left" />
          <el-table-column prop="nameSpace" label="命名空间" align="center" />
          <el-table-column prop="codeRepository" label="代码仓库" align="center">
            <!-- 使用作用域插槽来自定义列内容 -->
            <template #default="scope">
              <el-tooltip :content="scope.row.codeRepository" placement="right">
                <!-- 假设 codeRepository 包含 URL 字符串 -->
                <el-link :href="scope.row.codeRepository" target="_blank">
                  <el-icon size="large"><ChromeFilled /></el-icon>
                </el-link>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="serviceSpace" label="项目空间" align="center" />

          <el-table-column label="标签" align="center" width="100">
            <template #default="scope">
              <el-tooltip
                v-if="Object.keys(scope.row.labels || {}).length > 0"
                :content="JSON.stringify(scope.row.labels || {}, null, 2)"
                placement="top"
                effect="light"
              >
                <el-button type="primary" size="small" text>
                  <el-icon><CollectionTag /></el-icon>
                  <span style="margin-left: 4px">查看</span>
                </el-button>
              </el-tooltip>
              <el-tag v-else type="info" size="small">无标签</el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="createAt" label="创建时间" align="center" /> -->
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
      :title="formData.id === undefined ? '新增应用' : '修改应用'"
      @closed="resetForm"
      width="50%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item prop="serviceName" label="服务名">
          <el-input v-model="formData.serviceName" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="k8sCluster" label="k8s集群">
          <el-input v-model="formData.k8sCluster" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="nameSpace" label="命名空间">
          <el-input v-model="formData.nameSpace" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="codeRepository" label="代码仓库">
          <el-input v-model="formData.codeRepository" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="serviceSpace" label="项目空间">
          <el-input v-model="formData.serviceSpace" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="env" label="环境" v-if="formData.env !== undefined">
          <el-select v-model="formData.env" multiple placeholder="请选择环境" style="width: 240px">
            <el-option v-for="item in ['qa', 'prod']" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <div class="label-input">
            <el-select
              v-model="newLabelKey"
              placeholder="选择或输入标签键"
              filterable
              allow-create
              default-first-option
              style="width: 180px; margin-right: 10px"
            >
              <el-option label="department" value="department" />
              <el-option label="business" value="business" />
            </el-select>
            <el-select
              v-model="newLabelValue"
              placeholder="选择或输入标签值"
              style="width: 180px; margin-right: 10px"
              filterable
              allow-create
              default-first-option
            >
              <el-option v-for="item in labelValues" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" @click="addLabel">添加</el-button>
          </div>
          <div class="label-list" style="margin-left: 10px">
            <el-tag v-for="(value, key) in formData.labels" :key="key" closable @close="removeLabel(String(key))">
              {{ key }}: {{ value }}
            </el-tag>
          </div>
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

.label-input {
  margin-bottom: 10px;
}

.label-list {
  .el-tag {
    margin-right: 5px;
    margin-bottom: 5px;
  }
}
</style>
