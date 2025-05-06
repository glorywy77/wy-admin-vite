<script lang="ts" setup>
import { watch, onMounted, onUnmounted } from "vue"
import { useAppsDeploy } from "./apps-deploy"
import {
  Files,
  Search,
  Refresh,
  RefreshRight,
  VideoPlay,
  SwitchButton,
  RefreshLeft,
  Clock
} from "@element-plus/icons-vue"

const {
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
  startDeployDialogVisible,
  startDeployForm,
  confirmStartDeploy,
  handleStartDeploy,
  handleStopDeploy,
  handleReDeploy,
  deployHistoryVisible,
  historyData,
  showDeployHistory,
  imagesOptions,
  startAutoRefresh
} = useAppsDeploy()

defineOptions({
  name: "AppsDeploy"
})

watch([() => paginationData.currentPage, () => paginationData.pageSize], getAppsDeployPage, { immediate: true })

onMounted(() => {
  getAppsDeployPage()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="env" label="部署环境">
          <el-select v-model="searchData.env" placeholder="请选择" style="width: 180px" @change="handleSearch">
            <el-option label="生产环境 (prod)" value="prod" />
            <el-option label="测试环境 (qa)" value="qa" />
          </el-select>
        </el-form-item>
        <el-form-item prop="serviceSpace" label="项目空间">
          <el-select v-model="searchData.serviceSpace" placeholder="请选择" style="width: 180px" @change="handleSearch">
            <el-option label="wytest" value="wytest" />
          </el-select>
        </el-form-item>
        <el-form-item prop="serviceName" label="服务名">
          <el-input v-model="searchData.serviceName" placeholder="请输入" />
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
            <el-button type="primary" :icon="RefreshRight" circle @click="getAppsDeployPage" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="AppsDeployData" show-overflow-tooltip>
          <el-table-column prop="serviceName" label="服务名" align="left" />
          <el-table-column prop="deployResult" label="部署结果" align="center" width="150">
            <template #default="{ row }">
              <div class="status-display">
                <el-icon
                  :size="18"
                  :color="getStatusColor(row.deployResult)"
                  :class="{ 'is-loading': row.deployResult === 3 }"
                >
                  <!-- 添加旋转类 -->
                  <component :is="statusIcons[row.deployResult]" />
                </el-icon>
                <span :style="{ color: getStatusColor(row.deployResult), marginLeft: '6px' }">
                  {{ getResultStatusText(row.deployResult) }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deployStages" label="部署阶段" align="center" width="150">
            <template #default="{ row }">
              <div class="stage-icons">
                <el-tooltip
                  v-for="(status, index) in row.deployStages"
                  :key="index"
                  :content="getStageStatusText(status, index)"
                  placement="top"
                >
                  <el-icon
                    :size="18"
                    :color="getStatusColor(status)"
                    :class="{ 'is-loading': status === 3 }"
                    class="stage-icon"
                  >
                    <component :is="statusIcons[status]" />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="gitMsg" label="提交信息" align="left" width="200">
            <template #default="scope">
              <div v-if="scope.row.gitMsg">
                <span>
                  {{ scope.row.gitMsg.isTag === true ? "Tag" : "分支" }}：
                  <el-tooltip
                    :content="`提交时间：${scope.row.gitMsg.commitDateTime}，提交消息：${scope.row.gitMsg.commitMsg}，提交人：${scope.row.gitMsg.commitEmail}`"
                    placement="top"
                  >
                    <span>{{ scope.row.gitMsg.branch }}-{{ scope.row.gitMsg.commitId }}</span>
                  </el-tooltip>
                </span>
              </div>
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column prop="deployer" label="部署人" align="center" />
          <el-table-column prop="image" label="镜像" align="center">
            <template #default="scope">
              <el-tooltip
                v-if="scope.row.image && scope.row.image.trim() !== ''"
                :content="scope.row.image"
                placement="right"
              >
                <el-link @click="copyImageLink(scope.row.image)">
                  <el-icon size="large"><Files /></el-icon>
                </el-link>
              </el-tooltip>
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column prop="createAt" label="创建时间" align="center" />
          <el-table-column
            fixed="right"
            label="操作"
            width="200"
            align="center"
            class-name="fixed-action-column"
            :resizable="false"
          >
            <template #default="scope">
              <el-tooltip content="开始部署" placement="top">
                <el-button
                  type="success"
                  size="small"
                  :icon="VideoPlay"
                  circle
                  :disabled="scope.row.deployResult === 3"
                  @click="handleStartDeploy(scope.row)"
                />
              </el-tooltip>

              <el-tooltip content="停止部署" placement="top">
                <el-button
                  type="danger"
                  size="small"
                  :icon="SwitchButton"
                  circle
                  :disabled="scope.row.deployResult !== 3"
                  @click="handleStopDeploy(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="重新部署" placement="top">
                <el-button
                  type="primary"
                  size="small"
                  :icon="RefreshLeft"
                  circle
                  :disabled="scope.row.deployResult !== 1"
                  @click="handleReDeploy(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="部署历史" placement="top">
                <el-button type="info" size="small" :icon="Clock" circle @click="showDeployHistory(scope.row)" />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 添加对话框 -->
        <el-dialog v-model="startDeployDialogVisible" title="部署应用" :width="'70%'">
          <el-form :model="startDeployForm" label-width="80px">
            <el-form-item label="服务名">
              <el-input v-model="startDeployForm.serviceName" disabled />
            </el-form-item>
            <el-form-item label="分支">
              <el-select v-model="startDeployForm.branchOrTag" placeholder="请选择分支或标签">
                <el-option v-for="b in branchOptions" :key="b.branch" :value="b.branch">
                  <span style="float: left">{{ b.isTag ? "TAG" : "分支" }}: {{ b.branch }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ b.commitDateTime }}|{{ b.commitId }} | {{ b.commitMsg }} | {{ b.commitEmail }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="镜像">
              <el-radio-group v-model="startDeployForm.deployType">
                <el-radio :label="1">新镜像</el-radio>
                <el-radio :label="2">新镜像(仅Ci)</el-radio>
                <el-radio :label="3">历史镜像</el-radio>
              </el-radio-group>
              <el-select
                v-if="startDeployForm.deployType === 3"
                v-model="startDeployForm.selectedImage"
                placeholder="请先选择分支，再选择历史镜像"
                style="width: 100%; margin-top: 10px"
              >
                <el-option v-for="i in imagesOptions" :key="i.image" :label="i.image" :value="i.image">
                  <span style="float: left">{{ i.image?.split(":").pop() }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ i.gitMsg?.commitDateTime }}|{{ i.gitMsg?.commitId }}|{{ i.gitMsg?.commitMsg }}|{{
                      i.gitMsg?.commitEmail
                    }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="startDeployDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmStartDeploy" :loading="loading">确定</el-button>
          </template>
        </el-dialog>
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
    <!-- 在template末尾添加抽屉组件 -->
    <el-drawer v-model="deployHistoryVisible" title="部署历史记录" size="65%" direction="rtl">
      <el-table :data="historyData" border show-overflow-tooltip>
        <el-table-column type="index" label="序号" width="80" align="center" :index="(index) => index + 1" />
        <el-table-column prop="createAt" label="时间" width="150" />
        <el-table-column prop="deployer" label="操作人" width="100" />
        <el-table-column prop="gitMsg" label="提交信息" align="left">
          <template #default="scope">
            <div v-if="scope.row.gitMsg">
              <span>
                {{ scope.row.gitMsg.isTag === true ? "Tag" : "分支" }}：
                <el-tooltip
                  :content="`提交时间：${scope.row.gitMsg.commitDateTime}，提交消息：${scope.row.gitMsg.commitMsg}，提交人：${scope.row.gitMsg.commitEmail}`"
                  placement="top"
                >
                  <span>{{ scope.row.gitMsg.branch }}-{{ scope.row.gitMsg.commitId }}</span>
                </el-tooltip>
              </span>
            </div>
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.deployResult === 3 ? 'info' : scope.row.deployResult === 1 ? 'success' : 'danger'">
              {{ getResultStatusText(scope.row.deployResult || -1) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deployStages" label="部署阶段" align="center" width="150">
          <template #default="{ row }">
            <div class="stage-icons">
              <el-tooltip
                v-for="(status, index) in row.deployStages"
                :key="index"
                :content="getStageStatusText(status, index)"
                placement="top"
              >
                <el-icon
                  :size="18"
                  :color="getStatusColor(status)"
                  :class="{ 'is-loading': status === 3 }"
                  class="stage-icon"
                >
                  <component :is="statusIcons[status]" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gitMsg.commitMsg" label="提交信息" show-overflow-tooltip />
      </el-table>
    </el-drawer>
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

.stage-icons {
  display: flex;
  justify-content: center;
  gap: 8px;

  .stage-icon {
    vertical-align: middle;
  }
}

.status-display {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
