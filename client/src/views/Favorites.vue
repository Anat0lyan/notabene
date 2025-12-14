<template>
  <div class="notes-page">
    <Navigation />
    
    <div class="notes-layout">
      <TagsSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
      
      <div class="main-content">
        <div class="container">
          <div class="page-header">
            <div class="header-left">
              <button 
                v-if="isMobile" 
                @click="sidebarOpen = true" 
                class="tags-toggle-btn"
                title="Показать теги"
              >
                🏷️
              </button>
              <h1>Избранное</h1>
            </div>
          </div>
          
          <!-- Фиксированная кнопка "Новая заметка" -->
          <router-link to="/note/new" class="new-note-btn floating">+ Новая заметка</router-link>

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
            <p>Нет избранных заметок</p>
            <router-link to="/note/new" class="create-link">Создать заметку</router-link>
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

              <p 
                v-if="note.content" 
                class="note-content"
                v-html="linkifyText(note.content.substring(0, 150) + (note.content.length > 150 ? '...' : ''))"
              ></p>

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
import { onMounted, ref, onUnmounted, onBeforeUnmount } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Navigation from '@/components/Navigation.vue'
import TagItem from '@/components/TagItem.vue'
import Dropdown from '@/components/Dropdown.vue'
import TagsSidebar from '@/components/TagsSidebar.vue'
import { linkifyText } from '@/utils/textUtils'

const notesStore = useNotesStore()
const sidebarOpen = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    sidebarOpen.value = true // На десктопе всегда открыт
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // Автоматически включаем фильтр избранных
  notesStore.showFavorites = true
  await notesStore.fetchNotes()
  await notesStore.fetchTags()
})

onBeforeUnmount(() => {
  // Сбрасываем фильтр избранных при уходе со страницы
  notesStore.showFavorites = false
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tags-toggle-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
  display: none;
}

.tags-toggle-btn:hover {
  background: #5568d3;
}

@media (max-width: 767px) {
  .notes-layout {
    position: relative;
  }

  .container {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .tags-toggle-btn {
    display: block;
  }

  .filters {
    padding: 16px;
    margin-bottom: 16px;
  }

  .notes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .note-card {
    padding: 16px;
  }
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
  text-decoration: none;
  display: inline-block;
}

.new-note-btn:hover {
  background: #5568d3;
}

/* Фиксированная кнопка */
.new-note-btn.floating {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  padding: 16px 24px;
  font-size: 16px;
  border-radius: 50px;
  animation: fadeInUp 0.3s ease;
}

.new-note-btn.floating:hover {
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
  .new-note-btn.floating {
    bottom: 20px;
    right: 20px;
    padding: 14px 20px;
    font-size: 14px;
    border-radius: 50px;
  }
  
  /* Учитываем безопасную зону на мобильных */
  .new-note-btn.floating {
    bottom: max(20px, calc(20px + env(safe-area-inset-bottom, 0px)));
  }
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

.note-content :deep(.text-link) {
  color: #667eea;
  text-decoration: underline;
  word-break: break-all;
}

.note-content :deep(.text-link:hover) {
  color: #5568d3;
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
