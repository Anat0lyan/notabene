<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Notabene</h1>
      <p class="subtitle">Управление заметками и задачами</p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            minlength="6"
          />
        </div>

        <div v-if="mode === 'register'" class="form-group">
          <label>Имя пользователя</label>
          <input
            v-model="username"
            type="text"
            required
            placeholder="username"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>

        <button
          type="button"
          @click="toggleMode"
          class="toggle-mode-btn"
        >
          {{ mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const username = ref('')
const loading = ref(false)
const error = ref('')

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    let result
    if (mode.value === 'login') {
      result = await authStore.login(email.value, password.value)
    } else {
      if (!username.value.trim()) {
        error.value = 'Введите имя пользователя'
        loading.value = false
        return
      }
      result = await authStore.register(email.value, password.value, username.value)
    }

    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error || 'Произошла ошибка'
    }
  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 8px;
  font-size: 32px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #667eea;
  outline: none;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.submit-btn {
  background: #667eea;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #5568d3;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode-btn {
  background: transparent;
  color: #667eea;
  padding: 8px;
  font-size: 14px;
  text-decoration: underline;
}

.toggle-mode-btn:hover {
  color: #5568d3;
}
</style>
