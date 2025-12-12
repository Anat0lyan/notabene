<template>
  <div class="notes-page">
    <Navigation />
    
    <div class="notes-layout">
      <TagsSidebar />
      
      <div class="main-content">
        <div class="container">
          <div class="page-header">
            <h1>Мои заметки</h1>
            <router-link to="/note/new" class="new-note-btn">+ Новая заметка</router-link>
          </div>

          <div class="filters">
            <div class="search-box">
              <input
                v-model="notesStore.searchQuery"
                type="text"
                placeholder="Поиск заметок..."
                class="search-input"
              />
            </div>

            <div class="filter-controls">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="notesStore.showFavorites"
                />
                Только избранные
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="notesStore.showArchived"
                />
                Показать архивированные
              </label>

              <Dropdown label="Сортировка">
                <div class="dropdown-item" @click="notesStore.sortBy = 'updatedAt'; notesStore.sortOrder = 'desc'">
                  По дате обновления (новые)
                </div>
                <div class="dropdown-item" @click="notesStore.sortBy = 'updatedAt'; notesStore.sortOrder = 'asc'">
                  По дате обновления (старые)
                </div>
                <div class="dropdown-item" @click="notesStore.sortBy = 'createdAt'; notesStore.sortOrder = 'desc'">
                  По дате создания (новые)
                </div>
                <div class="dropdown-item" @click="notesStore.sortBy = 'title'; notesStore.sortOrder = 'asc'">
                  По названию (А-Я)
                </div>
              </Dropdown>
            </div>
          </div>

          <div v-if="notesStore.loading" class="loading">Загрузка...</div>

          <div v-else-if="notesStore.filteredNotes.length === 0" class="empty-state">
            <p>Нет заметок</p>
            <router-link to="/note/new" class="create-link">Создать первую заметку</router-link>
          </div>

          <div v-else class="notes-grid">
            <div
              v-for="note in notesStore.filteredNotes"
              :key="note.id"
              class="note-card"
              @click="$router.push(`/note/${note.id}`)"
            >
              <div class="note-header">
                <h3>{{ note.title }}</h3>
                <div class="note-actions">
                  <button
                    @click.stop="notesStore.toggleFavorite(note.id)"
                    class="icon-btn"
                    :class="{ active: note.isFavorite }"
                  >
                    ⭐
                  </button>
                  <button
                    @click.stop="notesStore.toggleArchive(note.id)"
                    class="icon-btn"
                  >
                    📦
                  </button>
                </div>
              </div>

              <p v-if="note.content" class="note-content">
                {{ note.content.substring(0, 150) }}{{ note.content.length > 150 ? '...' : '' }}
              </p>

              <div v-if="note.tags && note.tags.length > 0" class="note-tags">
                <TagItem
                  v-for="tag in note.tags"
                  :key="tag.id"
                  :tag="tag"
                />
              </div>

              <div class="note-footer">
                <span class="note-date">
                  {{ formatDate(note.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Navigation from '@/components/Navigation.vue'
import TagItem from '@/components/TagItem.vue'
import Dropdown from '@/components/Dropdown.vue'
import TagsSidebar from '@/components/TagsSidebar.vue'

const notesStore = useNotesStore()

onMounted(async () => {
  await notesStore.fetchNotes()
  await notesStore.fetchTags()
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.notes-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.notes-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

.main-content {
  flex: 1;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin: 0;
}

.new-note-btn {
  background: #667eea;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.new-note-btn:hover {
  background: #5568d3;
}

.filters {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}



.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.loading,
.empty-state {
  text-align: center;
  padding: 48px;
  color: #999;
}

.create-link {
  color: #667eea;
  text-decoration: underline;
  margin-top: 8px;
  display: inline-block;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.note-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e0e0e0;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-header h3 {
  flex: 1;
  margin: 0;
  font-size: 18px;
  color: #333;
}

.note-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.icon-btn:hover {
  opacity: 1;
}

.icon-btn.active {
  opacity: 1;
}

.note-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.note-tags {
  margin-bottom: 12px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.note-date {
  font-size: 12px;
}
</style>
