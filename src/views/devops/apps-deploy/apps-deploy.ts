import { reactive, ref } from "vue"
import {
  getAppsDeployPageApi,
  getImagesQueryApi,
  ciSumbitApi,
  cdSumbitApi,
  pipelineTerminateApi,
  getAppsDeployQueryApi
} from "@/api/devops/apps-deploy"
import { getGitBranchOrTagApi } from "@/api/devops/git"
import { type GetGitBranchesData } from "@/api/devops/git/types/git"
import {
  type GetAppsDeployData,
  GetImagesQueryData,
  GetAppsDeployQueryData
} from "@/api/devops/apps-deploy/types/apps-deploy"
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import { CircleCheck, CircleClose, Loading, Minus, VideoPause } from "@element-plus/icons-vue"
import { watch } from "vue"
import { useUserStore } from "@/store/modules/user"

const userStore = useUserStore()

export const useAppsDeploy = () => {
  const loading = ref<boolean>(false)
  const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
  const refreshTimer = ref<NodeJS.Timeout | null>(null)

  const AppsDeployData = ref<GetAppsDeployData[]>([])
  const searchFormRef = ref<FormInstance | null>(null)
  const searchData = reactive({
    serviceName: "",
    serviceSpace: "wytest",
    env: "qa"
  })

  const getAppsDeployPage = () => {
    loading.value = true

    getAppsDeployPageApi({
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize,
      serviceName: searchData.serviceName || undefined,
      serviceSpace: searchData.serviceSpace,
      env: searchData.env
    })
      .then(({ data }) => {
        paginationData.total = data.total
        AppsDeployData.value = data.items
      })
      .catch(() => {
        AppsDeployData.value = []
      })
      .finally(() => {
        loading.value = false
      })
  }

  const handleSearch = () => {
    paginationData.currentPage === 1 ? getAppsDeployPage() : (paginationData.currentPage = 1)
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    handleSearch()
  }

  const copyImageLink = (imageLink: string) => {
    navigator.clipboard
      .writeText(imageLink)
      .then(() => {
        ElMessage.success("复制成功")
      })
      .catch(() => {
        ElMessage.error("复制失败")
      })
  }

  const statusIcons = {
    3: Loading,
    1: CircleCheck,
    2: CircleClose,
    [-1]: Minus,
    [-2]: VideoPause
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 3:
        return "#409EFF"
      case 1:
        return "#67C23A"
      case 2:
        return "#F56C6C"
      case -1:
        return "#909399"
      case -2:
        return "#DAA520"
      default:
        return "#909399"
    }
  }

  const getStageStatusText = (status: number, stageIndex: number) => {
    const stageNames = ["CI阶段", "CD阶段", "监控检查"]
    const statusText = {
      3: "运行中",
      1: "成功",
      2: "失败",
      [-1]: "未开始"
    }[status]
    return `${stageNames[stageIndex]}：${statusText}`
  }

  const getResultStatusText = (status: number) => {
    return { 3: "部署中", 1: "成功", 2: "失败", [-2]: "取消" }[status]
  }

  // 开始部署
  const branchOptions = ref<GetGitBranchesData[]>([])
  const imagesOptions = ref<GetImagesQueryData[]>([])
  const startDeployDialogVisible = ref(false)
  const startDeployForm = reactive({
    serviceId: 0,
    serviceName: "",
    branchOrTag: "",
    deployType: 1,
    selectedImage: "",
    env: searchData.env,
    serviceSpace: searchData.serviceSpace // 添加 serviceSpace 属性
  })
  const handleStartDeploy = async (row: GetAppsDeployData) => {
    // 添加部署状态校验
    if (row.deployResult === 3) {
      ElMessage.warning("该服务正在部署中，请等待完成")
      return
    }

    // 重置部署类型和选择的分支,镜像列表
    startDeployForm.deployType = 1
    startDeployForm.branchOrTag = ""
    startDeployForm.selectedImage = ""
    imagesOptions.value = []
    //填入当前服务参数
    startDeployForm.serviceName = row.serviceName
    startDeployForm.env = row.env || searchData.env
    startDeployForm.serviceSpace = row.serviceSpace
    startDeployForm.serviceId = row.serviceId

    // 显示对话框
    startDeployDialogVisible.value = true

    // 异步获取分支或标签列表
    try {
      const { data } = await getGitBranchOrTagApi({
        serviceId: row.serviceId
      })
      branchOptions.value = data.items
    } catch (error) {
      ElMessage.error("获取分支或标签列表失败")
    }
  }

  // 添加watch监听分支选择变化
  watch(
    () => startDeployForm.branchOrTag,
    async (newBranch) => {
      if (newBranch && startDeployDialogVisible.value) {
        // 当分支变化时获取历史镜像
        try {
          const { data } = await getImagesQueryApi({
            serviceId: startDeployForm.serviceId,
            branchOrTag: newBranch,
            env: startDeployForm.env
          })
          imagesOptions.value = data.items
        } catch (error) {
          ElMessage.error("获取历史镜像列表失败")
        }
      }
    }
  )

  const confirmStartDeploy = () => {
    if (!startDeployForm.branchOrTag) {
      ElMessage.warning("请选择分支或标签")
      return
    }
    if (startDeployForm.deployType === 3 && !startDeployForm.selectedImage) {
      ElMessage.warning("请选择历史镜像")
      return
    }

    const executeDeployment = () => {
      loading.value = true
      let apiCall: Promise<any>

      if ([1, 2].includes(startDeployForm.deployType)) {
        // CI 模式（新镜像）

        apiCall = ciSumbitApi({
          serviceId: startDeployForm.serviceId,
          serviceSpace: startDeployForm.serviceSpace, // 添加 serviceSpace 属性
          serviceName: startDeployForm.serviceName,
          branchOrTag: startDeployForm.branchOrTag,
          gitMsg: branchOptions.value.find((b) => b.branch === startDeployForm.branchOrTag),
          env: startDeployForm.env,
          onlyCi: startDeployForm.deployType === 2, // 仅当类s型为2时开启onlyCi
          deployer: userStore.username,
          deployType: startDeployForm.deployType
        })
      } else {
        // CD 模式（历史镜像）
        apiCall = cdSumbitApi({
          serviceId: startDeployForm.serviceId,
          serviceName: startDeployForm.serviceName,
          serviceSpace: startDeployForm.serviceSpace,
          image: startDeployForm.selectedImage,
          env: startDeployForm.env,
          deployer: userStore.username,
          gitMsg: imagesOptions.value.find((i) => i.image === startDeployForm.selectedImage)?.gitMsg,
          deployType: startDeployForm.deployType
        })
      }

      apiCall
        .then(() => {
          ElMessage.success("部署任务已提交")
          startDeployDialogVisible.value = false
          getAppsDeployPage() // 刷新表格数据
        })
        .catch((error) => {
          ElMessage.error(`部署失败: ${error.message || "未知错误"}`)
        })
        .finally(() => {
          loading.value = false
        })
    }

    // 版本校验逻辑
    if ([1, 2].includes(startDeployForm.deployType)) {
      const selectedBranch = branchOptions.value.find((b) => b.branch === startDeployForm.branchOrTag)

      if (selectedBranch?.branch && selectedBranch?.commitId) {
        // 修改点：检查所有历史镜像中是否存在相同版本
        const hasSameVersion = (imagesOptions.value || []).some(
          (image) => image.image?.includes(selectedBranch.branch) && image.image.includes(selectedBranch.commitId)
        )

        if (hasSameVersion) {
          ElMessageBox.confirm("存在相同版本的历史镜像（分支+commitID），是否重新构建？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(executeDeployment)
            .catch(() => {
              console.log("用户取消操作")
            })
          return
        }
      }
    }

    // 直接执行部署（无重复构建情况）
    executeDeployment()
  }

  // 停止部署
  const handleStopDeploy = (row: GetAppsDeployData) => {
    if (row.deployResult !== 3) {
      ElMessage.warning("没有正在运行的任务")
      return
    }
    ElMessageBox.confirm("确定要停止当前部署吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        console.log("停止部署", row)
        try {
          loading.value = true
          await pipelineTerminateApi({
            uid: row.uid,
            ciPipelineName: row.ciPipelineName,
            cdPipelineName: row.cdPipelineName
          })
          ElMessage.success("已发送停止指令")
          // 刷新数据
          getAppsDeployPage()
        } catch (error) {
          // 断言 error 为 Error 类型以解决类型未知问题
          ElMessage.error(`停止失败: ${(error as Error).message || "未知错误"}`)
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        console.log("用户取消操作")
      })
  }

  // 重新部署
  const handleReDeploy = (row: GetAppsDeployData) => {
    // 添加部署状态校验
    if (row.deployResult === 3) {
      ElMessage.warning("该服务正在部署中，请等待完成")
      return
    }
    ElMessageBox.confirm("确定要重新部署该服务吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        try {
          loading.value = true
          // 直接使用当前行数据调用CD接口
          await cdSumbitApi({
            serviceId: row.serviceId,
            serviceName: row.serviceName,
            serviceSpace: row.serviceSpace,
            image: row.image, // 使用当前镜像
            env: row.env,
            deployer: userStore.username,
            gitMsg: row.gitMsg, // 使用已有git信息
            deployType: 3 // 重新部署类型
          })
          ElMessage.success("重新部署已发起")
          getAppsDeployPage() // 刷新数据
        } catch (error) {
          ElMessage.error(`部署失败: ${(error as Error).message || "未知错误"}`)
        } finally {
          loading.value = false
        }
      })
      .catch(() => {
        console.log("用户取消操作")
      })
  }

  // 部署历史
  const deployHistoryVisible = ref(false)
  const historyData = ref<GetAppsDeployQueryData[]>([])

  const showDeployHistory = async (row: GetAppsDeployData) => {
    try {
      loading.value = true
      const { data } = await getAppsDeployQueryApi({
        serviceId: row.serviceId,
        env: searchData.env
      })
      historyData.value = data.items
      deployHistoryVisible.value = true
    } catch (error) {
      ElMessage.error("获取部署历史失败")
    } finally {
      loading.value = false
    }
  }

  const startAutoRefresh = () => {
    refreshTimer.value = setInterval(async () => {
      try {
        const { data } = await getAppsDeployPageApi({
          currentPage: paginationData.currentPage,
          pageSize: paginationData.pageSize,
          serviceName: searchData.serviceName || undefined,
          serviceSpace: searchData.serviceSpace,
          env: searchData.env
        })
        // 直接更新数据，避免重新渲染整个表格
        AppsDeployData.value = data.items
        paginationData.total = data.total
      } catch (error) {
        AppsDeployData.value = []
      }
    }, 10000)
  }

  // 查询历史部署镜像
  return {
    loading,
    paginationData,
    handleCurrentChange,
    handleSizeChange,
    refreshTimer,
    AppsDeployData,
    searchFormRef,
    searchData,
    getAppsDeployPage,
    handleSearch,
    resetSearch,
    copyImageLink,
    statusIcons,
    getStatusColor,
    getStageStatusText,
    getResultStatusText,
    branchOptions,
    imagesOptions,
    startDeployDialogVisible,
    startDeployForm,
    confirmStartDeploy,
    handleStartDeploy,
    handleStopDeploy,
    handleReDeploy,
    deployHistoryVisible,
    historyData,
    showDeployHistory,
    startAutoRefresh
  }
}
