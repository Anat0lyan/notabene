<template>
  <nav class="navigation">
    <div class="nav-content">
      <router-link to="/" class="logo">Notabene</router-link>
      
      <!-- Гамбургер-меню для мобильных -->
      <button 
        v-if="isMobile" 
        @click="toggleMenu" 
        class="hamburger-btn"
        :class="{ active: menuOpen }"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Навигационные ссылки -->
      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ 'router-link-active': isNotesActive }"
          @click="closeMenu"
        >
          Заметки
        </router-link>
        <router-link 
          to="/dashboard" 
          class="nav-link"
          @click="closeMenu"
        >
          Дашборд
        </router-link>
      </div>

      <div class="nav-user">
        <span class="username">{{ authStore.username }}</span>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const menuOpen = ref(false)
const isMobile = ref(false)

// Проверка, активна ли страница заметок (включая все подстраницы)
const isNotesActive = computed(() => {
  const path = route.path
  return path === '/' || path.startsWith('/note')
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    menuOpen.value = false
  }
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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

.hamburger-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  width: 32px;
  height: 32px;
  justify-content: center;
}

.hamburger-btn span {
  display: block;
  width: 20px;
  height: 2px;
  background-color: #333;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

@media (max-width: 767px) {
  .hamburger-btn {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    gap: 0;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .nav-links.open {
    max-height: 200px;
  }

  .nav-link {
    padding: 16px 20px;
    border-bottom: 1px solid #f5f5f5;
    width: 100%;
  }

  .nav-link:last-child {
    border-bottom: none;
  }

  .nav-user {
    gap: 8px;
  }

  .username {
    display: none;
  }

  .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .logo {
    font-size: 20px;
  }
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
