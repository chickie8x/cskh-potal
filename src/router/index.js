import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authstore'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home/index.vue'),
    meta: { requiresAuth: true, role: 'CUSTOMER' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../components/view-content/customer/dashboard/index.vue'),
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('../components/view-content/customer/order/index.vue'),
        children: [
          {
            path: 'viettelpost',
            name: 'ViettelPostOrderCreate',
            component: () => import('../components/kits/connector/viettelpost/index.vue'),
          },
          {
            path: 'yunda',
            name: 'YundaExpressOrderCreate',
            component: () => import('../components/kits/connector/yunda/index.vue'),
          },
        ],
      },
      {
        path: 'ticket',
        name: 'Ticket',
        component: () => import('../components/view-content/customer/ticket/index.vue'),
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('../components/view-content/customer/address/index.vue'),
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('../components/view-content/customer/setting/index.vue'),
      },
    ],
  },

  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/index.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../components/view-content/admin/dashboard/index.vue'),
      },
      {
        path: 'logs',
        name: 'AdminLog',
        component: () => import('../components/view-content/admin/logs/index.vue'),
      },
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('../components/view-content/admin/user/index.vue'),
      },
    ],
  },

  {
    path: '/cs',
    name: 'CS',
    component: () => import('../views/cs/index.vue'),
    meta: { requiresAuth: true, role: 'CS_STAFF' },
    children: [
      {
        path: 'dashboard',
        name: 'CsDashboard',
        component: () => import('../components/view-content/cs/dashboard/index.vue'),
      },
      {
        path: 'order',
        name: 'CsOrder',
        component: () => import('../components/view-content/cs/order/index.vue'),
      },
      {
        path: 'ticket',
        name: 'CsTicket',
        component: () => import('../components/view-content/cs/ticket/index.vue'),
      },
    ],
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { requiresAuth: false },
  },

  {
    path: '/print-order/:partner',
    name: 'PrintOrder',
    component: () => import('../components/view-content/customer/print-order/index.vue'),
  },

  {
    path: '/forbidden',
    name: 'Forbidden',
    component: () => import('../views/forbidden/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/notfound/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const accessToken = authStore.accessToken
  const userRole = authStore.user?.role
  const pathRole = to.meta.role

  // 1. Chưa login mà vào route cần login
  if (to.meta.requiresAuth && !accessToken) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  }

  // 2. Đã login → không cho vào Login
  if (to.name === 'Login' && accessToken) {
    if (userRole === 'ADMIN') {
      return next({ name: 'AdminDashboard' })
    }
    if (userRole === 'CS_STAFF') {
      return next({ name: 'CsDashboard' })
    }
    return next({ name: 'Dashboard' })
  }

  if (to.path === '/') {
    if (userRole === 'ADMIN') {
      return next({ name: 'AdminDashboard' })
    }
    if (userRole === 'CS_STAFF') {
      return next({ name: 'CsDashboard' })
    }
    return next({ name: 'Dashboard' })
  }

  // 3. Kiểm tra quyền admin
  if (pathRole && userRole !== pathRole) {
    return next({ name: 'Forbidden' })
  }

  return next()
})

export default router
