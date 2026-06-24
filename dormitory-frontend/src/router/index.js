import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/Students.vue'),
        meta: { title: '学生管理' }
      },
      {
        path: 'buildings',
        name: 'Buildings',
        component: () => import('../views/Buildings.vue'),
        meta: { title: '宿舍楼管理' }
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: () => import('../views/Rooms.vue'),
        meta: { title: '房间管理' }
      },
      {
        path: 'check-records',
        name: 'CheckRecords',
        component: () => import('../views/CheckRecords.vue'),
        meta: { title: '入退宿管理' }
      },
      {
        path: 'repairs',
        name: 'Repairs',
        component: () => import('../views/Repairs.vue'),
        meta: { title: '报修管理' }
      },
      {
        path: 'visitors',
        name: 'Visitors',
        component: () => import('../views/Visitors.vue'),
        meta: { title: '访客管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
