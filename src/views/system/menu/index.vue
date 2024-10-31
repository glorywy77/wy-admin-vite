<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import { createMenuDataApi, deleteMenuDataApi, updateMenuDataApi, getMenuDataApi } from "@/api/system/menu"
import { type CreateOrUpdateMenuRequestData, type GetMenuData } from "@/api/system/menu/types/menu"

import { getRoleListApi } from "@/api/system/role"
import { type GetRoleData } from "@/api/system/role/types/role"

import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "SysMenu"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 表单提交
const DEFAULT_FORM_DATA: CreateOrUpdateMenuRequestData = {
  id: undefined,
  title: "",
  parent_id: undefined,
  roles: [],
  path: "",
  component: "",
  name: "",
  elIcon: "",
  keepAlive: 0,
  sort: 0
}
const isButtonDisabled = ref<boolean>(true)
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateMenuRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateMenuRequestData> = {
  title: [{ required: true, trigger: "blur", message: "请输入" }],
  roles: [{ required: true, trigger: "blur", message: "请选择角色" }],
  path: [{ required: true, trigger: "blur", message: "请输入" }],
  component: [{ required: true, trigger: "blur", message: "请输入" }],
  name: [{ required: true, trigger: "blur", message: "请输入" }],
  elIcon: [{ required: true, trigger: "blur", message: "请输入" }],
  keepAlive: [{ required: true, trigger: "blur", message: "请输入" }],
  sort: [{ required: true, trigger: "blur", message: "请输入" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createMenuDataApi : updateMenuDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getMenuData()
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

const parent_title = ref("")
const handleAddChildren = (row: GetMenuData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
  formData.value.parent_id = row.id
  parent_title.value = row.meta.title
}

//#region 删
const handleDelete = (row: GetMenuData) => {
  ElMessageBox.confirm(`正在删除：${row.meta.title} ，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteMenuDataApi({ id: row.id }).then(() => {
      ElMessage.success("删除成功")
      getMenuData()
    })
  })
}

// 批量删除
const mutipleSelection = ref<GetMenuData[]>([])

const handleSelectionChange = (val: GetMenuData[]) => {
  mutipleSelection.value = val
  if (val.length > 0) {
    isButtonDisabled.value = false
  }
  if (val.length === 0) {
    isButtonDisabled.value = true
  }
}
const handleBatchDelete = async (mutipleSelection?: GetMenuData[]) => {
  if (mutipleSelection) {
    // 首先确认是否真的要删除
    const confirmResult = await ElMessageBox.confirm(
      `正在删除选中的${mutipleSelection.length}个菜单，确认删除？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    )

    if (confirmResult === "confirm") {
      const deletePromises = mutipleSelection.map((row) => {
        return deleteMenuDataApi({ id: row.id })
      })

      try {
        await Promise.all(deletePromises)
        ElMessage.success("删除成功")
      } catch (error) {
        console.error("批量删除时发生错误", error)
        ElMessage.error("删除失败，请检查网络或稍后重试")
      }
      getMenuData()
    }
  }
}
//#endregion

//#region 改
const handleUpdate = (row: GetMenuData) => {
  dialogVisible.value = true
  formData.value.id = row.id
  formData.value.title = row.meta.title
  formData.value.parent_id = row.parent_id
  formData.value.roles = row.meta.roles
  formData.value.path = row.path
  formData.value.component = row.component
  formData.value.name = row.name
  formData.value.elIcon = row.meta.elIcon
  formData.value.keepAlive = row.meta.keepAlive
  formData.value.sort = row.sort
}

//#endregion

//#region 查
const treeProps = reactive({
  checkStrictly: true,
  children: "children"
})

const MenuData = ref<GetMenuData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  title: ""
})

const getMenuData = () => {
  loading.value = true
  getMenuDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    title: searchData.title || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      MenuData.value = data.items
    })
    .catch(() => {
      MenuData.value = []
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

onMounted(() => {
  RoleSelect()
})

const handleSearch = () => {
  paginationData.currentPage === 1 ? getMenuData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getMenuData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="title" label="菜单">
          <el-input v-model="searchData.title" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="handleAdd">新增菜单</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleBatchDelete(mutipleSelection)"
            :disabled="isButtonDisabled"
            >批量删除</el-button
          >
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getMenuData" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          :data="MenuData"
          :tree-props="treeProps"
          row-key="id"
          default-expand-all
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="30" align="center" />
          <!-- <el-table-column prop="id" label="id" align="left" /> -->
          <el-table-column prop="meta.title" label="标题" align="left" />
          <!-- <el-table-column prop="parent_id" label="父菜单id" align="center" /> -->
          <el-table-column prop="meta.roles" label="分配角色" align="center" />
          <!-- <el-table-column prop="path" label="path" align="center" />
          <el-table-column prop="name" label="name" align="center" />
          <el-table-column prop="component" label="component" align="center" />
          <el-table-column prop="meta.elIcon" label="elIcon" align="center" /> -->
          <el-table-column prop="meta.keepAlive" label="是否缓存" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.meta.keepAlive == 0" type="success" effect="plain">是</el-tag>
              <el-tag v-else type="danger" effect="plain">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" align="center" />

          <el-table-column fixed="right" label="操作" width="250" align="center">
            <template #default="scope">
              <el-button type="primary" text icon="Edit" bg size="small" @click="handleUpdate(scope.row)"
                >编辑</el-button
              >
              <el-button type="primary" text icon="Plus" bg size="small" @click="handleAddChildren(scope.row)"
                >新增</el-button
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
      :title="
        formData.parent_id === undefined && formData.id === undefined
          ? '新增菜单'
          : formData.parent_id !== undefined && formData.id === undefined
            ? parent_title + '-新增子菜单'
            : formData.title + '-修改菜单'
      "
      @closed="resetForm"
      width="33%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="right">
        <el-form-item prop="title" label="标题">
          <el-input v-model="formData.title" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="roles" label="角色" v-if="formData.roles !== undefined">
          <el-select v-model="formData.roles" multiple placeholder="请选择角色" style="width: 240px">
            <el-option v-for="item in RoleData" :key="item.roleName" :label="item.roleName" :value="item.roleName" />
          </el-select>
        </el-form-item>
        <el-form-item prop="path" label="路径">
          <el-input v-model="formData.path" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="component" label="组件">
          <!-- 使用slot或scoped slot来放置提示图标 -->
          <template #label>
            <span class="custom-label">
              组件
              <!-- 添加带有提示信息的图标 -->
              <el-tooltip
                class="box-item"
                effect="dark"
                content="主菜单Layouts 子菜单/views/.../index.vue"
                placement="right"
              >
                <el-icon size="small"><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="formData.component" placeholder="请输入" />
        </el-form-item>

        <el-form-item prop="name" label="名称">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="elIcon" label="elIcon">
          <template #label>
            <span class="custom-label">
              图标
              <el-tooltip
                class="box-item"
                effect="dark"
                content="elment-plus图标名称,https://element-plus.org/zh-CN/component/icon.html#icon-collection"
                placement="right"
              >
                <el-icon size="small"><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="formData.elIcon" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="keepAlive" label="是否缓存">
          <el-switch
            v-model="formData.keepAlive"
            inline-prompt
            :active-value="0"
            :inactive-value="1"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item prop="sort" label="排序">
          <el-input v-model="formData.sort" placeholder="排序" />
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

.custom-label {
  display: flex;
  align-items: center; /* 垂直居中 */
}
</style>
