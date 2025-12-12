<template>
  <nav class="navigation">
    <div class="nav-content">
      <router-link to="/" class="logo">Notabene</router-link>
      
      <div class="nav-links">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ 'router-link-active': isNotesActive }"
        >
          Заметки
        </router-link>
        <router-link to="/dashboard" class="nav-link">Дашборд</router-link>
      </div>

      <div class="nav-user">
        <span class="username">{{ authStore.username }}</span>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Проверка, активна ли страница заметок (включая все подстраницы)
const isNotesActive = computed(() => {
  const path = route.path
  return path === '/' || path.startsWith('/note')
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navigation {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #667eea;
  background-color: #f5f5f5;
}

.nav-link.router-link-active {
  color: #667eea;
  background-color: #e8eaf6;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background-color: #667eea;
  border-radius: 2px 2px 0 0;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #666;
  font-size: 14px;
}

.logout-btn {
  background: #f5f5f5;
  color: #333;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #e0e0e0;
}
</style>
