<template>
  <div class="dashboard-page">
    <Navigation />
    
    <div class="container">
      <h1>Дашборд</h1>

      <div v-if="tasksStore.loading" class="loading">Загрузка...</div>

      <div v-else class="dashboard-content">
        <!-- Statistics -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ tasksStore.stats.total }}</div>
            <div class="stat-label">Всего задач</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ tasksStore.stats.completed }}</div>
            <div class="stat-label">Выполнено</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ tasksStore.stats.dueToday }}</div>
            <div class="stat-label">На сегодня</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ tasksStore.stats.overdue }}</div>
            <div class="stat-label">Просрочено</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ tasksStore.stats.upcoming }}</div>
            <div class="stat-label">Предстоящие</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="filter-tabs">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="tasksStore.filter = filter.value"
              class="filter-tab"
              :class="{ active: tasksStore.filter === filter.value }"
            >
              {{ filter.label }}
            </button>
          </div>

          <div class="sort-controls">
            <select v-model="tasksStore.sortBy" class="sort-select">
              <option value="dueDate">По сроку</option>
              <option value="priority">По приоритету</option>
              <option value="createdAt">По дате создания</option>
              <option value="title">По названию</option>
            </select>
            <button
              @click="tasksStore.sortOrder = tasksStore.sortOrder === 'asc' ? 'desc' : 'asc'"
              class="sort-order-btn"
            >
              {{ tasksStore.sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="tasks-section">
          <h2>Задачи</h2>
          
          <div v-if="tasksStore.filteredTasks.length === 0" class="empty-state">
            Нет задач
          </div>

          <div v-else class="tasks-list">
            <TaskCard
              v-for="task in tasksStore.filteredTasks"
              :key="task.id"
              :task="task"
              @edit="() => handleEditTask(task)"
              @delete="() => handleDeleteTask(task.id)"
            />
          </div>
        </div>

        <!-- Модальное окно для создания задачи -->
        <div v-if="showTaskForm" class="modal-overlay" @click.self="showTaskForm = false">
          <div class="modal-content">
            <TaskForm
              @submit="handleCreateTask"
              @cancel="showTaskForm = false"
            />
          </div>
        </div>

        <!-- Фиксированная кнопка добавления задачи -->
        <button @click="showTaskForm = true" class="new-task-btn floating">
          + Новая задача
        </button>

        <!-- Favorite Notes -->
        <div class="favorites-section">
          <h2>Избранные заметки</h2>
          
          <div v-if="notesStore.favoriteNotes.length === 0" class="empty-state">
            Нет избранных заметок
          </div>

          <div v-else class="notes-list">
            <div
              v-for="note in notesStore.favoriteNotes"
              :key="note.id"
              class="note-item"
              @click="$router.push(`/note/${note.id}`)"
            >
              <h3>{{ note.title }}</h3>
              <p 
                v-if="note.content" 
                class="note-preview"
                v-html="linkifyText(note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''))"
              ></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useNotesStore } from '@/stores/notes'
import Navigation from '@/components/Navigation.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import { linkifyText } from '@/utils/textUtils'

const tasksStore = useTasksStore()
const notesStore = useNotesStore()
const showTaskForm = ref(false)

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'today', label: 'Сегодня' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'overdue', label: 'Просрочено' },
  { value: 'completed', label: 'Выполнено' },
  { value: 'pending', label: 'В работе' }
]

onMounted(async () => {
  await tasksStore.fetchStats()
  await notesStore.fetchNotes()
})

const handleEditTask = (task: any) => {
  // Simple edit - you can enhance this
  const newTitle = prompt('Новое название:', task.title)
  if (newTitle && newTitle !== task.title) {
    tasksStore.updateTask(task.id, { title: newTitle })
  }
}

const handleDeleteTask = async (taskId: string) => {
  if (confirm('Удалить задачу?')) {
    await tasksStore.deleteTask(taskId)
  }
}

const handleCreateTask = async (taskData: any) => {
  try {
    await tasksStore.createTask(taskData)
    showTaskForm.value = false
    await tasksStore.fetchStats()
  } catch (error) {
    console.error('Ошибка при создании задачи:', error)
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #999;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.stats-grid::-webkit-scrollbar {
  height: 6px;
}

.stats-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.stats-grid::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.stats-grid::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 100px;
  white-space: nowrap;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .stats-grid {
    gap: 8px;
  }
  
  .stat-card {
    padding: 10px 12px;
    min-width: 80px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 11px;
  }
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 6px;
  background: #f5f5f5;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #e0e0e0;
}

.filter-tab.active {
  background: #667eea;
  color: white;
}

.sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.sort-order-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 16px;
  cursor: pointer;
}

.tasks-section,
.favorites-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.tasks-section h2,
.favorites-section h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 20px 0;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #999;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.note-item {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.note-item:hover {
  background: #f0f0f0;
}

.note-item h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
}

.note-preview {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.note-preview :deep(.text-link) {
  color: #667eea;
  text-decoration: underline;
  word-break: break-all;
}

.note-preview :deep(.text-link:hover) {
  color: #5568d3;
}

/* Фиксированная кнопка добавления задачи */
.new-task-btn.floating {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  background: #667eea;
  color: white;
  padding: 16px 24px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.2s;
  animation: fadeInUp 0.3s ease;
}

.new-task-btn.floating:hover {
  background: #5568d3;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптация для мобильных */
@media (max-width: 767px) {
  .new-task-btn.floating {
    bottom: 20px;
    right: 20px;
    padding: 14px 20px;
    font-size: 14px;
    bottom: max(20px, calc(20px + env(safe-area-inset-bottom, 0px)));
  }
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
