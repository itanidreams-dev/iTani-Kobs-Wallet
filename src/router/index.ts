import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia } from 'pinia'
import pinia from '@/pinia'
import { useWalletStore } from '@/stores/wallet'
import DashboardView from '../views/DashboardView.vue'
import AuthView from '../views/AuthView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ImportWalletView from '../views/ImportWalletView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'auth',
      component: AuthView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/import-wallet',
      name: 'import-wallet',
      component: ImportWalletView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('../views/AccountsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/send',
      name: 'send',
      component: () => import('../views/SendView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/swap',
      name: 'swap',
      component: () => import('../views/SwapView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

setActivePinia(pinia)

router.beforeEach((to) => {
  const walletStore = useWalletStore()

  if (to.meta.requiresAuth && !walletStore.isAuthenticated) {
    return { name: 'auth' }
  }

  if (to.name === 'auth' && walletStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
