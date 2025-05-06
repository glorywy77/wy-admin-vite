// // core
// import { createApp } from "vue"
// import App from "@/App.vue"
// import store from "@/store"
// import router from "@/router"
// import "@/router/permission"
// // load
// import { loadSvg } from "@/icons"
// import { loadPlugins } from "@/plugins"
// import { loadDirectives } from "@/directives"
// // css
// import "uno.css"
// import "normalize.css"
// import "element-plus/dist/index.css"
// import "element-plus/theme-chalk/dark/css-vars.css"
// import "vxe-table/lib/style.css"
// import "vxe-table-plugin-element/dist/style.css"
// import "@/styles/index.scss"

// const app = createApp(App)

// /** 加载插件 */
// loadPlugins(app)
// /** 加载全局 SVG */
// loadSvg(app)
// /** 加载自定义指令 */
// loadDirectives(app)

// app.use(store).use(router)
// router.isReady().then(() => {
//   app.mount("#app")
// })

// main.ts
import { createApp } from "vue"
import App from "@/App.vue"
import store from "@/store" // 引入 Pinia store
import router from "@/router"
import "@/router/permission" // 引入权限管理
// load
import { loadSvg } from "@/icons"
import { loadPlugins } from "@/plugins"
import { loadDirectives } from "@/directives"
// css
import "uno.css"
import "normalize.css"
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "vxe-table/lib/style.css"
import "vxe-table-plugin-element/dist/style.css"
import "@/styles/index.scss"

// 引入 WebSocket store
import { useWebSocketStore } from "@/store/modules/websocket"
import { useUserStore } from "@/store/modules/user"

const app = createApp(App)

// 加载插件
loadPlugins(app)
// 加载全局 SVG
loadSvg(app)
// 加载自定义指令
loadDirectives(app)

// 应用 store 和 router
app.use(store).use(router)

router.isReady().then(() => {
  app.mount("#app")

  // 确保在 app.mount() 后再初始化 WebSocket 连接
  const userStore = useUserStore()
  const websocketStore = useWebSocketStore()
  // 连接 WebSocket 并在连接建立成功后发送登录消息
  const userid = userStore.userid
  websocketStore.connect("ws://127.0.0.1:8800/socket", userid)
})
