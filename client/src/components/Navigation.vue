<template>
  <nav class="navigation">
    <div class="nav-content">
      <router-link to="/" class="logo">Notabene</router-link>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">Заметки</router-link>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
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
