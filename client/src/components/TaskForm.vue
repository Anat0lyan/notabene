<template>
  <div class="task-form">
    <h3>{{ task ? 'Редактировать задачу' : 'Новая задача' }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название *</label>
        <input v-model="formData.title" type="text" required />
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea v-model="formData.description" rows="3"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Приоритет</label>
          <select v-model="formData.priority">
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div class="form-group">
          <label>Срок выполнения</label>
          <input v-model="dueDateInput" type="datetime-local" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Отмена
        </button>
        <button type="submit" class="btn-primary">
          {{ task ? 'Сохранить' : 'Создать' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Task } from '@/types'

const props = defineProps<{
  task?: Task | null
  noteId?: string | null
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const formData = ref({
  title: props.task?.title || '',
  description: props.task?.description || '',
  priority: props.task?.priority || 'medium',
  dueDate: props.task?.dueDate || null,
  noteId: props.noteId || props.task?.noteId || null
})

const dueDateInput = computed({
  get: () => {
    if (!formData.value.dueDate) return ''
    const date = new Date(formData.value.dueDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  },
  set: (value: string) => {
    formData.value.dueDate = value ? new Date(value) : null
  }
})

watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority,
      dueDate: newTask.dueDate || null,
      noteId: newTask.noteId || null
    }
  }
})

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}
</script>

<style scoped>
.task-form {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.task-form h3 {
  margin: 0 0 24px 0;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
