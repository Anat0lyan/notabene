<template>
  <div class="task-card" :class="{ completed: task.completed }">
    <div class="task-header">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="toggleTask"
        class="task-checkbox"
      />
      <h3 class="task-title">{{ task.title }}</h3>
      <span class="priority-badge" :class="`priority-${task.priority}`">
        {{ priorityLabel }}
      </span>
    </div>

    <p v-if="task.description" class="task-description">{{ task.description }}</p>

    <div class="task-meta">
      <span v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue }">
        📅 {{ formatDate(task.dueDate) }}
      </span>
      <span v-if="task.noteTitle" class="note-link">
        📝 {{ task.noteTitle }}
      </span>
    </div>

    <div class="task-actions">
      <button @click="$emit('edit')" class="action-btn">Редактировать</button>
      <button @click="$emit('delete')" class="action-btn delete">Удалить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { useTasksStore } from '@/stores/tasks'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const tasksStore = useTasksStore()

const priorityLabel = computed(() => {
  const labels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }
  return labels[props.task.priority]
})

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.completed) return false
  return new Date(props.task.dueDate) < new Date()
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const toggleTask = () => {
  tasksStore.toggleTask(props.task.id)
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #e0e0e0;
  transition: all 0.2s;
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.priority-low {
  background: #e8f5e9;
  color: #2e7d32;
}

.priority-medium {
  background: #fff3e0;
  color: #e65100;
}

.priority-high {
  background: #ffebee;
  color: #c62828;
}

.task-description {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

.due-date.overdue {
  color: #c62828;
  font-weight: 500;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  background: #f5f5f5;
  color: #333;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.delete {
  background: #ffebee;
  color: #c62828;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}
</style>
