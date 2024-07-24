<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {
  createCasbinRuleDataApi,
  deleteCasbinRuleDataApi,
  updateCasbinRuleDataApi,
  getCasbinRuleDataApi
} from "@/api/system/casbin"
import { type CreateOrUpdateCasbinRuleRequestData, type GetCasbinRuleData } from "@/api/system/casbin/types/casbin"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "CasbinRule"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateCasbinRuleRequestData = {
  id: undefined,
  p_type: "p",
  v0: "",
  v1: "",
  v2: "",
  v3: "",
  v4: "",
  v5: "",
  summary: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateCasbinRuleRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateCasbinRuleRequestData> = {
  v0: [{ required: true, trigger: "change", message: "请选择角色" }],
  v1: [{ required: true, trigger: "blur", message: "请输入路径" }],
  v2: [{ required: true, trigger: "change", message: "请选择方法" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createCasbinRuleDataApi : updateCasbinRuleDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getCasbinRuleData()
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

//#region 删
const handleDelete = (row: GetCasbinRuleData) => {
  ElMessageBox.confirm(`正在删除：${row.v0} ${row.v1} ${row.v2}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteCasbinRuleDataApi({ id: row.id }).then(() => {
      ElMessage.success("删除成功")
      getCasbinRuleData()
    })
  })
}

// 批量删除
const mutipleSelection = ref<GetCasbinRuleData[]>([])

const handleSelectionChange = (val: GetCasbinRuleData[]) => {
  mutipleSelection.value = val
}
const handleBatchDelete = async (mutipleSelection?: GetCasbinRuleData[]) => {
  if (mutipleSelection) {
    // 首先确认是否真的要删除
    const confirmResult = await ElMessageBox.confirm(
      `正在删除选中的${mutipleSelection.length}个策略，确认删除？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    if (confirmResult === "confirm") {
      const deletePromises = mutipleSelection.map((row) => {
        return deleteCasbinRuleDataApi({ id: row.id })
      })

      try {
        await Promise.all(deletePromises)
        ElMessage.success("删除成功")
      } catch (error) {
        console.error("批量删除用户时发生错误", error)
        ElMessage.error("删除失败，请检查网络或稍后重试")
      }
      await getCasbinRuleData()
    }
  }
}
//#endregion

//#region 改
const handleUpdate = (row: GetCasbinRuleData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}

//#endregion

//#region 查
const casbinRuleData = ref<GetCasbinRuleData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  v0: "",
  v1: "",
  v2: ""
})
const getCasbinRuleData = () => {
  loading.value = true
  getCasbinRuleDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    v0: searchData.v0 || undefined,
    v1: searchData.v1 || undefined,
    v2: searchData.v2 || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      casbinRuleData.value = data.items
    })
    .catch(() => {
      casbinRuleData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getCasbinRuleData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getCasbinRuleData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="v0" label="角色">
          <el-input v-model="searchData.v0" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="v1" label="接口">
          <el-input v-model="searchData.v1" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="v2" label="方法">
          <el-input v-model="searchData.v2" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增规则</el-button>
          <el-button type="danger" :icon="Delete" @click="handleBatchDelete(mutipleSelection)">批量删除</el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getCasbinRuleData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="casbinRuleData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="v0" label="角色" align="center" />
          <el-table-column prop="v1" label="接口" align="center" />
          <el-table-column prop="v2" label="方法" align="center" />
          <el-table-column prop="summary" label="描述" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
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
      :title="formData.id === undefined ? '新增规则' : '修改规则'"
      @closed="resetForm"
      width="33%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item prop="v0" label="角色">
          <el-select v-model="formData.v0" placeholder="选择角色">
            <el-option label="admin" value="admin" />
            <el-option label="dev" value="dev" />
            <el-option label="ops" value="ops" />
          </el-select>
        </el-form-item>
        <el-form-item prop="v1" label="接口">
          <el-input v-model="formData.v1" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="v2" label="方法">
          <el-select v-model="formData.v2" placeholder="选择方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item prop="summary" label="描述">
          <el-input v-model="formData.summary" placeholder="请输入" />
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
