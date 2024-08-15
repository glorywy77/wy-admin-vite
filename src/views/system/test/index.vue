<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {
  createRoleDataApi,
  deleteRoleDataApi,
  updateRoleDataApi,
  getRoleDataApi,
  getRoleHasApisDataApi,
  getRoleAllApisDataApi
} from "@/api/system/role"

import { type CreateOrUpdateRoleRequestData, type GetRoleData } from "@/api/system/role/types/role"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox, ElTree } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "Test"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const hasApisData = ref<any>([])
const allApisData = ref<any>([])
//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateRoleRequestData = {
  id: undefined,
  role: "",
  description: ""
}
const isButtonDisabled = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const activeStep = ref(0)
const dialogWidth = ref("30%")
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateRoleRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const treeRef = ref<InstanceType<typeof ElTree>>()
const rules: FormRules<CreateOrUpdateRoleRequestData> = {
  role: [{ required: true, trigger: "blur", message: "请输入" }],
  description: [{ required: true, trigger: "blur", message: "请输入" }]
}

const handleCreateOrUpdate = () => {
  console.log("0")
  loading.value = true
  formData.value.hasApis = treeRef.value!.getCheckedKeys(true) as number[]
  const api = formData.value.id === undefined ? createRoleDataApi : updateRoleDataApi
  api(formData.value)
    .then(() => {
      ElMessage.success("操作成功")
      dialogVisible.value = false
      getRoleData()
    })
    .finally(() => {
      loading.value = false
    })
}
const resetForm = () => {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
//#endregion
const handleAdd = () => {
  activeStep.value = 0
  dialogVisible.value = true
  getRoleAllApisDataApi()
    .then(({ data }) => {
      hasApisData.value = [12] //默认具备查询自身信息的接口
      allApisData.value = data.allApis.treeData
    })
    .finally(() => {
      loading.value = false
    })
}

//#region 删
const handleDelete = (row: GetRoleData) => {
  ElMessageBox.confirm(`正在删除：${row.role} ，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteRoleDataApi({ role: row.role }).then(() => {
      ElMessage.success("删除成功")
      getRoleData()
    })
  })
}

// 批量删除
const mutipleSelection = ref<GetRoleData[]>([])

const handleSelectionChange = (val: GetRoleData[]) => {
  mutipleSelection.value = val
  if (val.length > 0) {
    isButtonDisabled.value = false
  }
  if (val.length === 0) {
    isButtonDisabled.value = true
  }
}
const handleBatchDelete = async (mutipleSelection?: GetRoleData[]) => {
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
        return deleteRoleDataApi({ role: row.role })
      })

      try {
        await Promise.all(deletePromises)
        ElMessage.success("删除成功")
      } catch (error) {
        console.error("批量删除用户时发生错误", error)
        ElMessage.error("删除失败，请检查网络或稍后重试")
      }
      await getRoleData()
    }
  }
}
//#endregion

//#region 改
const handleUpdate = async (row: GetRoleData) => {
  activeStep.value = 0
  dialogVisible.value = true
  formData.value = cloneDeep(row)

  try {
    const [allApisResponse, hasApisResponse] = await Promise.all([
      getRoleAllApisDataApi(),
      getRoleHasApisDataApi({ role: row.role })
    ])

    allApisData.value = allApisResponse.data.allApis.treeData
    hasApisData.value = hasApisResponse.data.hasApis.apiKeys
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    loading.value = false
  }
}

//#endregion

//#region 查
const RoleData = ref<GetRoleData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  role: ""
})
const getRoleData = () => {
  loading.value = true
  getRoleDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    role: searchData.role || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      RoleData.value = data.items
    })
    .catch(() => {
      RoleData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getRoleData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getRoleData, { immediate: true })

const defaultProps = {
  children: "children",
  label: "label"
}

const nextStep = () => {
  if (activeStep.value < 1) {
    activeStep.value++
  }
}

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="role" label="角色">
          <el-input v-model="searchData.role" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">新增角色</el-button>
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
            <el-button type="primary" :icon="RefreshRight" circle @click="getRoleData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="RoleData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="role" label="角色" align="left" />
          <el-table-column prop="description" label="描述" align="center" />
          <el-table-column prop="createAt" label="创建时间" align="center" />
          <el-table-column prop="updateAt" label="更新时间" align="center" />
          <el-table-column fixed="right" label="操作" width="280" align="center">
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
      :title="formData.id === undefined ? '新增角色' : '编辑角色'"
      @closed="resetForm"
      :width="dialogWidth"
    >
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="基本信息" />
        <el-step title="分配权限" />
      </el-steps>

      <template v-if="activeStep === 0">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
          <el-form-item label="角色名" prop="role">
            <el-input v-model="formData.role" style="width: 100%" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="formData.description" type="textarea" />
          </el-form-item>
        </el-form>
      </template>

      <template v-else-if="activeStep === 1">
        <div class="tree-container">
          <el-tree
            ref="treeRef"
            :data="allApisData"
            :default-checked-keys="hasApisData"
            show-checkbox
            node-key="id"
            :props="defaultProps"
          />
        </div>
      </template>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button @click="prevStep">上一步</el-button>

          <el-button type="primary" v-if="activeStep < 1" @click="nextStep">下一步</el-button>
          <el-button type="primary" v-else @click="handleCreateOrUpdate">保存</el-button>
        </span>
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

.transfer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
