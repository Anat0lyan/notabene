import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Notes',
      component: () => import('@/views/Notes.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/note/:id',
      name: 'NoteDetail',
      component: () => import('@/views/NoteDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/note/:id/edit',
      name: 'NoteEdit',
      component: () => import('@/views/NoteEdit.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/note/new',
      name: 'NoteNew',
      component: () => import('@/views/NoteEdit.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.loading) {
    await authStore.init()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
