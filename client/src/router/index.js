import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', component: () => import('../pages/LandingPage.vue') },
  { path: '/auth', component: () => import('../pages/AuthPage.vue') },
  { path: '/dashboard', component: () => import('../pages/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/exam-setup', component: () => import('../pages/ExamSetup.vue'), meta: { requiresAuth: true } },
  { path: '/exam', component: () => import('../pages/ExamRoom.vue'), meta: { requiresAuth: true } },
  { path: '/results', component: () => import('../pages/Results.vue'), meta: { requiresAuth: true } },
  { path: '/review/:id', component: () => import('../pages/ReviewPage.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    next('/auth')
  } else if (authStore.token && (to.path === '/' || to.path === '/auth')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
