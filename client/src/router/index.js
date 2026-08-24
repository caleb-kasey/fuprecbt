import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../pages/LandingPage.vue'),
    meta: { title: 'FUPRE CBT Portal - Home' },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../pages/AuthPage.vue'),
    meta: { title: 'Sign In / Register - FUPRE CBT' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true, title: 'Dashboard - FUPRE CBT' },
  },
  {
    path: '/exam-setup',
    name: 'ExamSetup',
    component: () => import('../pages/ExamSetup.vue'),
    meta: { requiresAuth: true, title: 'Exam Setup - FUPRE CBT' },
  },
  {
    path: '/exam',
    name: 'ExamRoom',
    component: () => import('../pages/ExamRoom.vue'),
    meta: { requiresAuth: true, title: 'Exam in Progress - FUPRE CBT' },
  },
  {
    path: '/results',
    name: 'Results',
    component: () => import('../pages/Results.vue'),
    meta: { requiresAuth: true, title: 'Exam Results - FUPRE CBT' },
  },
  {
    path: '/review/:id',
    name: 'Review',
    component: () => import('../pages/ReviewPage.vue'),
    meta: { requiresAuth: true, title: 'Exam Review - FUPRE CBT' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.title) {
    document.title = to.meta.title;
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ path: '/auth', query: { redirect: to.fullPath } });
  } else if (authStore.isLoggedIn && (to.path === '/' || to.path === '/auth')) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
