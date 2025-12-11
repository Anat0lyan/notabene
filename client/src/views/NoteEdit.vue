<template>
  <div class="note-edit-page">
    <Navigation />
    
    <div class="container">
      <div class="page-header">
        <router-link :to="note ? `/note/${note.id}` : '/'" class="back-btn">← Назад</router-link>
        <h1>{{ note ? 'Редактировать заметку' : 'Новая заметка' }}</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="note-form">
        <div class="form-group">
          <label>Название *</label>
          <input
            v-model="formData.title"
            type="text"
            required
            placeholder="Название заметки"
            class="title-input"
          />
        </div>

        <div class="form-group">
          <label>Содержимое</label>
          <textarea
            v-model="formData.content"
            rows="15"
            placeholder="Текст заметки..."
            class="content-textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Теги</label>
          <TagInput v-model="formData.tags" />
        </div>

        <div class="form-actions">
          <button type="button" @click="handleCancel" class="btn-secondary">
            Отмена
          </button>
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
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
import TagInput from '@/components/TagInput.vue'
import type { Note, Tag } from '@/types'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

const note = ref<Note | null>(null)
const loading = ref(false)
const formData = ref({
  title: '',
  content: '',
  tags: [] as string[]
})

onMounted(async () => {
  const noteId = route.params.id as string
  if (noteId && noteId !== 'new') {
    await loadNote(noteId)
  }
})

const loadNote = async (noteId: string) => {
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

      formData.value = {
        title: note.value.title,
        content: note.value.content || '',
        tags: note.value.tags?.map(t => t.name) || []
      }
    }
  } catch (error) {
    console.error('Error loading note:', error)
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (note.value) {
      await notesStore.updateNote(note.value.id, {
        title: formData.value.title,
        content: formData.value.content,
        tags: formData.value.tags
      })
    } else {
      await notesStore.createNote({
        title: formData.value.title,
        content: formData.value.content,
        tags: formData.value.tags
      })
    }
    router.push(note.value ? `/note/${note.value.id}` : '/')
  } catch (error) {
    console.error('Error saving note:', error)
    alert('Ошибка при сохранении заметки')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push(note.value ? `/note/${note.value.id}` : '/')
}
</script>

<style scoped>
.note-edit-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.back-btn {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 8px;
  display: inline-block;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin: 0;
}

.note-form {
  background: white;
  border-radius: 8px;
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
}

.title-input:focus {
  outline: none;
  border-color: #667eea;
}

.content-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
}

.content-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
