import { type RouteRecordRaw, createRouter } from "vue-router"
import { history, flatMultiLevelRoutes } from "./helper"
import routeSettings from "@/config/route"
import { getMenuDataApi } from "@/api/system/menu"
import { type GetMenuData } from "@/api/system/menu/types/menu"
const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },

  {
    path: "/link",
    meta: {
      title: "外链",
      svgIcon: "link"
    },
    children: [
      {
        path: "https://juejin.cn/post/7089377403717287972",
        component: () => {},
        name: "Link1",
        meta: {
          title: "中文文档"
        }
      },
      {
        path: "https://juejin.cn/column/7207659644487139387",
        component: () => {},
        name: "Link2",
        meta: {
          title: "新手教程"
        }
      }
    ]
  },
  {
    path: "/personal",
    component: Layouts,
    children: [
      {
        path: "personal",
        component: () => import("@/views/personal/index.vue"),
        name: "Personal",
        meta: {
          title: "个人中心",
          elIcon: "Star",
          affix: false
        }
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
import { ref } from "vue"

const res = ref<GetMenuData[]>([])

//从后端来获取菜单数据
const getMenuData = async () => {
  const { data } = await getMenuDataApi({})
  res.value = data.items
  return res
}

//使用 await 等待异步操作完后端返回菜单数据赋值给 menuData
const menuData = await getMenuData()

// 转换函数
const transformRoutes = (data: any) => {
  return data.map((item: GetMenuData) => ({
    path: item.path,
    component: item.component === "Layouts" ? Layouts : () => import(/* @vite-ignore */ ".." + item.component),
    name: item.name,
    meta: {
      title: item.meta.title,
      elIcon: item.meta.elIcon,
      roles: item.meta.roles || [],
      keepAlive: item.meta.keepAlive === 1
    },
    children: item.children && transformRoutes(item.children)
  }))
}

export const dynamicRoutes: RouteRecordRaw[] = transformRoutes(menuData.value)

/**
 * 原始方法目前已弃用
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/system",
    component: Layouts,
    name: "System",
    meta: {
      title: "系统管理",
      elIcon: "Setting",
      roles: ["admin"]
    },
    children: [
      {
        path: "user",
        component: () => import("@/views/system/user/index.vue"),
        name: "User",
        meta: {
          title: "用户管理",
          elIcon: "User",
          keepAlive: true,
          roles: ["admin"]
        }
      },
      {
        path: "role",
        component: () => import("@/views/system/role/index.vue"),
        name: "Role",
        meta: {
          title: "角色管理",
          elIcon: "Tickets",
          keepAlive: true,
          roles: ["admin"]
        }
      },

      {
        path: "sysApi",
        component: () => import("@/views/system/api/index.vue"),
        name: "SysApi",
        meta: {
          title: "接口管理",
          elIcon: "Operation",
          keepAlive: true,
          roles: ["admin"]
        }
      },
      {
        path: "sysMenu",
        component: () => import("@/views/system/menu/index.vue"),
        name: "SysMenu",
        meta: {
          title: "菜单管理",
          elIcon: "Menu",
          keepAlive: true,
          roles: ["admin"]
        }
      }
    ]
  },
  {
    path: "/monitor",
    component: Layouts,
    name: "Monitor",
    meta: {
      title: "监控",
      elIcon: "Monitor",
      roles: ["admin"]
    },
    children: [
      {
        path: "auditLog",
        component: () => import("@/views/monitor/auditLog/index.vue"),
        name: "AuditLog",
        meta: {
          title: "审计日志",
          elIcon: "Reading",
          keepAlive: true,
          roles: ["admin"]
        }
      },
      {
        path: "aliEcs",
        component: () => import("@/views/monitor/aliEcs/index.vue"),
        name: "AliEcs",
        meta: {
          title: "ECS",
          elIcon: "Cpu",
          keepAlive: true,
          roles: ["admin"]
        }
      }
    ]
  },
  {
    path: "/permission",
    component: Layouts,
    redirect: "/permission/page",
    name: "Permission",
    meta: {
      title: "权限",
      svgIcon: "lock",
      roles: ["admin", "editor"], // 可以在根路由中设置角色
      alwaysShow: true // 将始终显示根菜单
    },
    children: [
      {
        path: "page",
        component: () => import("@/views/permission/page.vue"),
        name: "PagePermission",
        meta: {
          title: "页面级",
          roles: ["admin"] // 或者在子导航中设置角色
        }
      },
      {
        path: "directive",
        component: () => import("@/views/permission/directive.vue"),
        name: "DirectivePermission",
        meta: {
          title: "按钮级" // 如果未设置角色，则表示：该页面不需要权限，但会继承根路由的角色
        }
      }
    ]
  }
]
**/

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
