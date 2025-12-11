<template>
  <div class="note-detail-page">
    <Navigation />
    
    <div class="container">
      <div v-if="loading" class="loading">Загрузка...</div>
      
      <div v-else-if="note" class="note-detail">
        <div class="note-header">
          <div class="header-actions">
            <router-link to="/" class="back-btn">← Назад</router-link>
            <div class="action-buttons">
              <button
                @click="toggleFavorite"
                class="action-btn"
                :class="{ active: note.isFavorite }"
              >
                ⭐ {{ note.isFavorite ? 'В избранном' : 'В избранное' }}
              </button>
              <button
                @click="toggleArchive"
                class="action-btn"
              >
                {{ note.isArchived ? 'Разархивировать' : 'Архивировать' }}
              </button>
              <router-link :to="`/note/${note.id}/edit`" class="action-btn">
                Редактировать
              </router-link>
              <button @click="handleDelete" class="action-btn delete">
                Удалить
              </button>
            </div>
          </div>
        </div>

        <div class="note-content">
          <h1>{{ note.title }}</h1>
          
          <div v-if="note.tags && note.tags.length > 0" class="note-tags">
            <TagItem
              v-for="tag in note.tags"
              :key="tag.id"
              :tag="tag"
            />
          </div>

          <div class="note-body">
            <p v-if="note.content" class="content-text">{{ note.content }}</p>
            <p v-else class="empty-content">Нет содержимого</p>
          </div>

          <div class="note-meta">
            <span>Создано: {{ formatDate(note.createdAt) }}</span>
            <span>Обновлено: {{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>

        <NoteTasks :note-id="note.id" />
      </div>

      <div v-else class="not-found">
        <p>Заметка не найдена</p>
        <router-link to="/" class="back-link">Вернуться к заметкам</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useNotesStore } from '@/stores/notes'
import Navigation from '@/components/Navigation.vue'
import TagItem from '@/components/TagItem.vue'
import NoteTasks from '@/components/NoteTasks.vue'
import type { Note, Tag } from '@/types'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

const note = ref<Note | null>(null)
const loading = ref(true)

onMounted(async () => {
  await loadNote()
})

const loadNote = async () => {
  const noteId = route.params.id as string
  try {
    const noteDoc = await getDoc(doc(db, 'notes', noteId))
    if (noteDoc.exists()) {
      const data = noteDoc.data()
      
      // Load full tag information
      let tags: Tag[] = []
      if (data.tags && data.tags.length > 0) {
        await notesStore.fetchTags()
        tags = data.tags.map((tagRef: any) => {
          const tagId = typeof tagRef === 'string' ? tagRef : tagRef.id
          const fullTag = notesStore.tags.find(t => t.id === tagId)
          return fullTag || { id: tagId, name: tagId, userId: data.userId, createdAt: new Date() }
        })
      }
      
      note.value = {
        id: noteDoc.id,
        userId: data.userId,
        title: data.title,
        content: data.content || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isArchived: data.isArchived || false,
        isFavorite: data.isFavorite || false,
        tags
      } as Note
    }
  } catch (error) {
    console.error('Error loading note:', error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async () => {
  if (note.value) {
    await notesStore.toggleFavorite(note.value.id)
    note.value.isFavorite = !note.value.isFavorite
  }
}

const toggleArchive = async () => {
  if (note.value) {
    await notesStore.toggleArchive(note.value.id)
    note.value.isArchived = !note.value.isArchived
    if (note.value.isArchived) {
      router.push('/')
    }
  }
}

const handleDelete = async () => {
  if (note.value && confirm('Удалить заметку?')) {
    try {
      await notesStore.deleteNote(note.value.id)
      router.push('/')
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.note-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.loading,
.not-found {
  text-align: center;
  padding: 48px;
  color: #999;
}

.back-link {
  color: #667eea;
  text-decoration: underline;
  margin-top: 8px;
  display: inline-block;
}

.note-detail {
  background: white;
  border-radius: 8px;
  padding: 32px;
}

.note-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.active {
  background: #fff3e0;
  color: #e65100;
}

.action-btn.delete {
  background: #ffebee;
  color: #c62828;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.note-content h1 {
  font-size: 32px;
  color: #333;
  margin: 0 0 16px 0;
}

.note-tags {
  margin-bottom: 24px;
}

.note-body {
  margin-bottom: 24px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.empty-content {
  color: #999;
  font-style: italic;
}

.note-meta {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #999;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}
</style>
