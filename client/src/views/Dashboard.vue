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
              <p v-if="note.content" class="note-preview">
                {{ note.content.substring(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useNotesStore } from '@/stores/notes'
import Navigation from '@/components/Navigation.vue'
import TaskCard from '@/components/TaskCard.vue'

const tasksStore = useTasksStore()
const notesStore = useNotesStore()

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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
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
</style>
