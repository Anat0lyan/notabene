<template>
  <nav class="navigation">
    <div class="nav-content">
      <div class="logo-section">
        <router-link to="/" class="logo">Notabene</router-link>
        <span v-if="isMobile" class="current-page-title">{{ currentPageTitle }}</span>
      </div>
      
      <!-- Навигационные ссылки -->
      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ 'router-link-active': isHomeActive }"
          @click="closeMenu"
        >
          Избранное
        </router-link>
        <router-link 
          to="/dashboard" 
          class="nav-link"
          @click="closeMenu"
        >
          Дашборд
        </router-link>
        <!-- Кнопка выхода в меню на мобильных -->
        <button 
          v-if="isMobile" 
          @click="handleLogout" 
          class="logout-menu-btn"
        >
          Выйти
        </button>
      </div>

      <div class="nav-user">
        <span class="username">{{ authStore.username }}</span>
        <button 
          v-if="!isMobile" 
          @click="handleLogout" 
          class="logout-btn"
        >
          Выйти
        </button>
        <!-- Гамбургер-меню для мобильных -->
        <button 
          v-if="isMobile" 
          @click="toggleMenu" 
          class="hamburger-btn"
          :class="{ active: menuOpen }"
          :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'"
          title="Меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
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

// Проверка, активна ли главная страница (избранное)
const isHomeActive = computed(() => {
  return route.path === '/'
})

// Название текущей страницы для мобильной версии
const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Избранное'
  if (path === '/dashboard') return 'Дашборд'
  if (path.startsWith('/note/') && path.endsWith('/edit')) return 'Редактирование'
  if (path.startsWith('/note/')) return 'Заметка'
  if (path === '/note/new') return 'Новая заметка'
  return 'Notabene'
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

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
}

.current-page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
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
  .logo-section {
    flex: 1;
  }

  .logo {
    font-size: 20px;
  }

  .current-page-title {
    font-size: 14px;
    color: #666;
  }

  .hamburger-btn {
    display: flex;
    margin-left: auto;
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
    max-height: 300px;
  }

  .nav-link {
    padding: 16px 20px;
    border-bottom: 1px solid #f5f5f5;
    width: 100%;
  }

  .nav-link:last-child {
    border-bottom: 1px solid #f5f5f5;
  }

  .logout-menu-btn {
    width: 100%;
    padding: 16px 20px;
    background: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 0;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s;
    border-bottom: 1px solid #e0e0e0;
  }

  .logout-menu-btn:hover {
    background: #e0e0e0;
  }

  .nav-user {
    gap: 8px;
    margin-left: auto;
  }

  .username {
    display: none;
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
