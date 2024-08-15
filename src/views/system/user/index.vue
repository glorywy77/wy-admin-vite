<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import {
  createUserDataApi,
  deleteUserDataApi,
  updateUserDataApi,
  getUserDataApi,
  resetUserPassApi
} from "@/api/system/user"
import {
  type CreateOrUpdateUserRequestData,
  type GetUserData,
  type DeleteUserData
} from "@/api/system//user/types/user"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

import { getRoleListApi } from "@/api/system/role"
import { type GetRoleData } from "@/api/system/role/types/role"

defineOptions({
  // 命名当前组件
  name: "User"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateUserRequestData = {
  id: undefined,
  userid: "",
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  roles: [],
  enable: 0,
  remark: ""
}

const isButtonDisabled = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateUserRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateUserRequestData> = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }],
  email: [{ required: true, trigger: "blur", message: "请输入邮箱" }],
  roles: [{ required: true, trigger: "blur", message: "请选择角色" }],
  enable: [{ required: true, trigger: "blur", message: "请选择状态" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api =
      formData.value.id === undefined
        ? createUserDataApi
        : formData.value.password === undefined
          ? updateUserDataApi
          : resetUserPassApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getUserData()
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
const handleDelete = (row: GetUserData) => {
  const DELETE_FROM_DATA: DeleteUserData = {
    id: row.id,
    username: row.username
  }
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteUserDataApi(DELETE_FROM_DATA).then(() => {
      ElMessage.success("删除成功")
      getUserData()
    })
  })
}

// 批量删除
const mutipleSelection = ref<GetUserData[]>([])

const handleSelectionChange = (val: GetUserData[]) => {
  mutipleSelection.value = val
  if (val.length > 0) {
    isButtonDisabled.value = false
  }
  if (val.length === 0) {
    isButtonDisabled.value = true
  }
}
const handleBatchDelete = async (mutipleSelection?: GetUserData[]) => {
  if (mutipleSelection) {
    // 首先确认是否真的要删除
    const confirmResult = await ElMessageBox.confirm(
      `正在删除选中的${mutipleSelection.length}个用户，确认删除？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    if (confirmResult === "confirm") {
      const deletePromises = mutipleSelection.map((row) => {
        const DELETE_FROM_DATA: DeleteUserData = {
          id: row.id,
          username: row.username
        }
        return deleteUserDataApi(DELETE_FROM_DATA)
      })

      try {
        await Promise.all(deletePromises)
        ElMessage.success("删除成功")
      } catch (error) {
        console.error("批量删除用户时发生错误", error)
        ElMessage.error("删除失败，请检查网络或稍后重试")
      }
      getUserData()
    }
  }
}
//#endregion

//#region 改

//#更新用户的基础信息
const handleUpdate = (row: GetUserData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}

//#重置用户密码,其他信息不修改
const handleResetPass = (row: GetUserData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
  formData.value.password = ""
  formData.value.confirmPassword = ""
  formData.value.email = undefined
  formData.value.roles = undefined
  formData.value.enable = undefined
  formData.value.remark = undefined
}

//#endregion

//#region 查
const userData = ref<GetUserData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  username: "",
  email: ""
})
const getUserData = () => {
  loading.value = true
  getUserDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    username: searchData.username || undefined,
    email: searchData.email || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      userData.value = data.items
    })
    .catch(() => {
      userData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

//# 查询可以选择的角色
const RoleData = ref<GetRoleData[]>([])
const RoleSelect = () => {
  getRoleListApi().then(({ data }) => {
    RoleData.value = data.items
  })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getUserData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

onMounted(() => {
  RoleSelect()
})

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getUserData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="searchData.email" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增用户</el-button>
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
            <el-button type="primary" :icon="RefreshRight" circle @click="getUserData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="userData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="30" align="center" />
          <el-table-column prop="username" label="用户名" align="center" />
          <el-table-column prop="email" label="邮箱" align="center" />
          <el-table-column prop="roles" label="角色" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.roles.includes('admin')" type="primary" effect="plain">admin</el-tag>
              <el-tag v-else type="warning" effect="plain">{{ scope.row.roles }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enable" label="状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.enable == 0" type="success" effect="plain">启用</el-tag>
              <el-tag v-else type="danger" effect="plain">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_at" label="创建时间" align="center" />
          <el-table-column prop="update_at" label="更新时间" align="center" />
          <el-table-column prop="remark" label="备注" align="center" />
          <el-table-column fixed="right" label="操作" width="250" align="center">
            <template #default="scope">
              <el-button type="primary" text icon="Edit" bg size="small" @click="handleUpdate(scope.row)"
                >编辑</el-button
              >
              <el-button type="danger" text icon="Delete" bg size="small" @click="handleDelete(scope.row)"
                >删除</el-button
              >
              <el-button type="warning" text bg size="small" @click="handleResetPass(scope.row)">密码重置</el-button>
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
      :title="formData.id === undefined ? '新增用户' : formData.password === undefined ? '修改用户' : '重置密码'"
      @closed="resetForm"
      width="33%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item prop="username" label="用户名">
          <el-input v-if="formData.id === undefined" v-model="formData.username" placeholder="请输入" />
          <el-text v-else>{{ formData.username }}</el-text>
        </el-form-item>
        <el-form-item prop="password" label="密码" v-if="formData.password !== undefined">
          <el-input type="password" show-password v-model="formData.password" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="password" label="确认密码" v-if="formData.confirmPassword !== undefined">
          <el-input type="password" show-password v-model="formData.confirmPassword" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱" v-if="formData.email !== undefined">
          <el-input v-model="formData.email" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="enable" label="状态" v-if="formData.enable !== undefined">
          <el-switch
            v-model="formData.enable"
            inline-prompt
            :active-value="0"
            :inactive-value="1"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item prop="roles" label="角色" v-if="formData.roles !== undefined">
          <el-select v-model="formData.roles" multiple placeholder="请选择角色" style="width: 240px">
            <el-option v-for="item in RoleData" :key="item.roleName" :label="item.roleName" :value="item.roleName" />
          </el-select>
        </el-form-item>

        <el-form-item prop="remark" label="备注" v-if="formData.remark !== undefined">
          <el-input v-model="formData.remark" placeholder="请输入" />
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
