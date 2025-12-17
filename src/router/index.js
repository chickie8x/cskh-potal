import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authstore'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home/index.vue'),
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../components/view-content/admin/dashboard/index.vue'),
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: () => import('../components/view-content/admin/order/index.vue'),
      },
      {
        path: 'ticket',
        name: 'AdminTicket',
        component: () => import('../components/view-content/admin/ticket/index.vue'),
      },
      {
        path: 'address',
        name: 'AdminAddress',
        component: () => import('../components/view-content/admin/address/index.vue'),
      },
      {
        path: 'setting',
        name: 'AdminSetting',
        component: () => import('../components/view-content/admin/setting/index.vue'),
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

  // 1. Chưa login mà vào route cần login
  if (to.meta.requiresAuth && !accessToken) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  }

  // 2. Đã login → không cho vào Login
  if (to.name === 'Login' && accessToken) {
    return next({ name: 'Dashboard' })
  }

  if (to.path === '/') {
    return next({ name: 'Dashboard' })
  }

  // 3. Kiểm tra quyền admin
  if (to.fullPath.includes('/admin')) {
    const role = authStore.user?.role
    if (!role || role !== 'ADMIN') {
      return next({ name: 'Forbidden' })
    }
  }

  // 4. Cho phép đi tiếp
  return next()
})

export default router
