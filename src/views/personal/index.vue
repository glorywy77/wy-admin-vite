<template>
  <div class="app-container">
    <el-card>
      <el-tabs>
        <el-tab-pane label="基本信息">
          <div class="form-container">
            <el-form label-width="120px" :model="userInfoForm" :rules="userInfoRule" ref="userInfoFormRef">
              <el-form-item label="创建时间">
                <el-input style="width: 400px" v-model="userInfoForm.create_at" disabled />
              </el-form-item>
              <el-form-item label="用户名" prop="username" required>
                <el-input style="width: 400px" v-model="userInfoForm.username" />
              </el-form-item>
              <el-form-item label="角色" prop="roles">
                <el-select style="width: 400px" v-model="userInfoForm.roles" multiple placeholder="请选择角色" disabled>
                  <el-option v-for="item in userInfoForm.roles" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input style="width: 400px" v-model="userInfoForm.email" />
              </el-form-item>
              <el-form-item style="margin-top: 40px">
                <el-button type="primary" style="margin-right: 20px" @click="handleEditUser(userInfoFormRef)"
                  >更新</el-button
                >
                <el-button type="primary" plain @click="toDefault">关闭</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="修改密码">
          <div class="form-container">
            <el-form label-width="120px" :model="passForm" ref="passFormRef" :rules="passFormRules">
              <el-form-item label="新密码" prop="password" required>
                <el-input
                  style="width: 400px"
                  v-model="passForm.password"
                  autocomplete="new-password"
                  placeholder="请输入新密码"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword" required>
                <el-input
                  style="width: 400px"
                  v-model="passForm.confirmPassword"
                  autocomplete="new-password"
                  placeholder="确认密码不能为空"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item style="margin-top: 40px">
                <el-button type="primary" style="margin-right: 20px" @click="handleModifyPass(passFormRef)"
                  >确定</el-button
                >
                <el-button type="primary" plain @click="toDefault">关闭</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import { type FormInstance, type FormRules, ElMessage } from "element-plus"
import { useUserStore } from "@/store/modules/user"
import { updateUserDataApi, resetUserPassApi, getUserDataApi } from "@/api/personal"
import { type GetUserData } from "@/api/personal/types/personal"

const userStore = useUserStore()
const router = useRouter()
const userData = ref<GetUserData>()
const toDefault = () => {
  router.push("/")
}

// 基本信息表单
const userInfoFormRef = ref<FormInstance>()
const userInfoForm = reactive({
  id: 0,
  create_at: "",
  username: "",
  // phone: "",
  email: "",
  roles: [""]
})

const userInfoRule: FormRules = reactive({
  username: [{ required: true, trigger: "blur", message: "请填写用户名" }],
  // phone: [{ validator: useValidatePhone, trigger: "blur" }],
  email: [{ required: true, trigger: "blur", message: "请输入邮箱" }]
})

const handleEditUser = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      updateUserDataApi({
        id: userInfoForm.id,
        username: userInfoForm.username,
        // phone: userInfoForm.phone,
        email: userInfoForm.email
      })
        .then((res: any) => {
          if (res.code === 0) {
            ElMessage.success("操作成功")
          }
        })
        .catch(() => {})
    }
  })
}

// 修改密码表单
const passFormRef = ref<FormInstance>()

const passForm = reactive({
  id: 0,
  username: "",
  password: "",
  confirmPassword: ""
})

const equalToPassword = (rule: any, value: any, callback: any) => {
  if (passForm.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const passFormRules: FormRules = reactive({
  password: [
    { required: true, trigger: "blur", message: "新密码不能为空" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "确认密码不能为空" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ]
})

const handleModifyPass = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      resetUserPassApi({
        id: passForm.id,
        username: passForm.username,
        password: passForm.password,
        confirmPassword: passForm.confirmPassword
      })
        .then((res: any) => {
          if (res.code === 0) {
            ElMessage.success("操作成功")
          }
        })
        .catch(() => {})
    }
  })
}

const GetUserNowData = () => {
  getUserDataApi({
    username: passForm.username
  })
    .then(({ data }) => {
      userData.value = data.item
      userInfoForm.roles = userData.value.roles
      userInfoForm.email = userData.value.email
    })
    .catch(() => {})
}

// 获取缓存数据
const getCache = () => {
  userInfoForm.username = userStore.username
  userInfoForm.create_at = userStore.create_at
  userInfoForm.id = userStore.id
  passForm.id = userStore.id
  passForm.username = userStore.username
}

// 初始化缓存数据和实时数据，
// 缓存的数据是不能修改的数据，实时数据是修改会即使生效并查询到的数据
onMounted(() => {
  getCache()
  GetUserNowData()
  // console.log(userInfoForm)
})
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20px;
}
</style>
