<template>
  <div class="note-tasks">
    <div class="tasks-header">
      <h4>Задачи ({{ tasks.length }})</h4>
      <button @click="showForm = !showForm" class="add-task-btn">
        {{ showForm ? 'Отмена' : '+ Добавить задачу' }}
      </button>
    </div>

    <TaskForm
      v-if="showForm"
      :note-id="noteId"
      @submit="handleCreateTask"
      @cancel="showForm = false"
    />

    <div v-if="tasks.length === 0 && !loading" class="empty-tasks">
      Нет задач
    </div>

    <div v-else class="tasks-list">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @edit="() => handleEditTask(task)"
        @delete="() => handleDeleteTask(task.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import TaskCard from './TaskCard.vue'
import TaskForm from './TaskForm.vue'
import type { Task } from '@/types'

const props = defineProps<{
  noteId: string
}>()

const tasksStore = useTasksStore()
const tasks = ref<Task[]>([])
const loading = ref(false)
const showForm = ref(false)

onMounted(async () => {
  await loadTasks()
})

const loadTasks = async () => {
  loading.value = true
  try {
    tasks.value = await tasksStore.fetchTasksByNote(props.noteId)
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
}

const handleCreateTask = async (taskData: any) => {
  try {
    await tasksStore.createTask({
      ...taskData,
      noteId: props.noteId
    })
    await loadTasks()
    showForm.value = false
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

const handleEditTask = async (task: Task) => {
  // Simple edit - you can enhance this with a modal
  const newTitle = prompt('Новое название:', task.title)
  if (newTitle && newTitle !== task.title) {
    try {
      await tasksStore.updateTask(task.id, { title: newTitle })
      await loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }
}

const handleDeleteTask = async (taskId: string) => {
  if (confirm('Удалить задачу?')) {
    try {
      await tasksStore.deleteTask(taskId)
      await loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}
</script>

<style scoped>
.note-tasks {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tasks-header h4 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.add-task-btn {
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.add-task-btn:hover {
  background: #5568d3;
}

.empty-tasks {
  text-align: center;
  color: #999;
  padding: 24px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
