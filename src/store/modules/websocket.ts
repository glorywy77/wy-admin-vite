import { defineStore } from "pinia"
import { ref, Ref } from "vue"
import { logoutApi } from "@/api/login"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"

// 定义消息接口，包含事件类型和数据
interface Message {
  e: string // 事件类型
  d: any // 消息数据，根据实际消息结构调整类型
}

export const useWebSocketStore = defineStore("websocket", () => {
  // WebSocket 实例引用
  const socket: Ref<WebSocket | null> = ref(null)

  // 连接状态标记
  const connected: Ref<boolean> = ref(false)

  // 存储收到的消息列表
  const messages: Ref<Message[]> = ref([])

  // 心跳检测间隔ID
  let heartbeatInterval: NodeJS.Timeout | undefined

  // 重连尝试计数器
  let reconnectAttempts: number = 0

  // 最大重连尝试次数
  const maxReconnectAttempts: number = 10

  // 重连超时ID
  let reconnectTimeout: NodeJS.Timeout | undefined

  // 发送心跳包以保持连接活动
  const sendHeartbeat = (): void => {
    if (!socket.value || !connected.value) {
      console.warn("WebSocket is not connected.")
      return
    }

    // 创建并发送心跳消息
    const heartbeatMessage: Message = { e: "ping", d: {} }
    socket.value.send(JSON.stringify(heartbeatMessage))
  }

  // 建立 WebSocket 连接
  const connect = (url: string, userid: string): void => {
    close() // 确保关闭任何现有的连接

    // 创建新的 WebSocket 实例
    socket.value = new WebSocket(url)

    // 当连接成功建立时触发
    socket.value.onopen = () => {
      console.log("WebSocket connection established")
      connected.value = true
      reconnectAttempts = 0 // 重置重连尝试计数器
      sendLoginMessage(userid)
        .then(() => startHeartbeat()) // 成功后启动心跳检测
        .catch(console.error)
    }

    // 接收服务器消息时触发
    socket.value.onmessage = (event: MessageEvent<string>) => {
      try {
        // 解析并处理接收到的消息
        const message: Message = JSON.parse(event.data)
        messages.value.push(message)
        handleForceOffline(message) // 处理强制下线通知
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    // 出现错误时触发
    socket.value.onerror = (error: Event) => {
      console.error("WebSocket error:", error)
    }

    // 连接关闭时触发
    socket.value.onclose = (event: CloseEvent) => {
      console.log("WebSocket connection closed", event)
      connected.value = false
      stopHeartbeat()
      attemptReconnect(url, userid) // 尝试重连
    }
  }

  // 启动心跳检测机制
  const startHeartbeat = (): void => {
    if (heartbeatInterval) clearInterval(heartbeatInterval)
    heartbeatInterval = setInterval(sendHeartbeat, 30000) // 每30秒发送一次心跳
  }

  // 停止心跳检测机制
  const stopHeartbeat = (): void => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = undefined
    }
  }

  // 发送登录消息给服务器
  const sendLoginMessage = async (userId: string): Promise<void> => {
    if (!socket.value || !connected.value) {
      console.warn("WebSocket is not connected.")
      throw new Error("WebSocket is not connected.")
    }

    // 创建并发送登录消息
    const loginMessage: Message = { e: "login", d: { userid: userId } }
    socket.value.send(JSON.stringify(loginMessage))
  }

  // 发送离线消息给服务器
  const sendOffineMessage = async (userId: string): Promise<void> => {
    if (!socket.value || !connected.value) {
      console.warn("WebSocket is not connected.")
      throw new Error("WebSocket is not connected.")
    }

    // 创建并发送离线消息
    const offlineMessage: Message = { e: "force_offine", d: { userid: userId } }
    socket.value.send(JSON.stringify(offlineMessage))
  }

  // 关闭 WebSocket 连接
  const close = (): void => {
    stopHeartbeat() // 确保先停止心跳检测
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
  }

  // 尝试重新连接到 WebSocket 服务器
  const attemptReconnect = (url: string, userid: string): void => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`)
      if (reconnectTimeout) clearTimeout(reconnectTimeout)

      // 使用指数退避算法计算等待时间，最大等待时间为30秒
      const waitTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
      reconnectTimeout = setTimeout(() => {
        connect(url, userid)
      }, waitTime)
    } else {
      console.error("Max reconnection attempts reached. Please check the server status.")
    }
  }

  /** 登出 */
  const router = useRouter()
  const logout = (): void => {
    logoutApi()
    ElMessage.error("您已被强制下线，请重新登录！")
    window.location.reload() // 刷新页面
    router.push("/login") // 跳转到登录页面
  }

  // 处理来自服务器的强制下线通知
  const handleForceOffline = (message: Message): void => {
    //console.log(message.e)
    if (message.e === "force_offine_client") {
      console.warn(`Received force_offine message for user ${message.d.userid}`)
      logout()
    }
  }

  // 返回可被外部调用的方法和状态
  return { connect, sendLoginMessage, sendOffineMessage, close, connected, messages }
})
