<template>
    <!-- Overlay для мобильных -->
    <div 
      v-if="isOpen && isMobile" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>
    
    <div class="tags-sidebar" :class="{ open: isOpen, mobile: isMobile }">
      <div class="sidebar-header">
        <h2>Теги</h2>
        <button v-if="isMobile" @click="closeSidebar" class="close-sidebar-btn">×</button>
      </div>

    <div class="search-box">
      <input
        v-model="notesStore.tagSearchQuery"
        type="text"
        placeholder="Поиск по тегам..."
        class="search-input"
      />
    </div>

    <div class="tags-list">
      <div
        v-for="tag in filteredTags"
        :key="tag.id"
        class="tag-item-wrapper"
        :class="{ selected: isTagSelected(tag.id) }"
        @click="toggleTag(tag.id)"
      >
        <TagItem :tag="tag" />
        <span v-if="tag.noteCount !== undefined" class="tag-count">
          ({{ tag.noteCount }})
        </span>
        <button
          @click.stop="openColorPicker(tag)"
          class="color-picker-btn"
          title="Изменить цвет"
        >
          🎨
        </button>
      </div>

      <div v-if="filteredTags.length === 0" class="empty-tags">
        <p>Теги не найдены</p>
      </div>
    </div>

    <!-- Модальное окно выбора цвета -->
    <div v-if="showColorPicker" class="color-picker-modal" @click.self="closeColorPicker">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3>Выберите цвет для тега "{{ selectedTag?.name }}"</h3>
          <button @click="closeColorPicker" class="close-btn">×</button>
        </div>
        <div class="color-palette">
          <div
            v-for="color in colorPalette"
            :key="color"
            class="color-option"
            :class="{ active: selectedTag?.color === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color === null ? 'Без цвета' : color"
          >
            <span v-if="selectedTag?.color === color" class="checkmark">✓</span>
          </div>
        </div>
        <div class="color-picker-actions">
          <button @click="removeColor" class="remove-color-btn" v-if="selectedTag?.color">
            Убрать цвет
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, watch } from 'vue'
import { useNotesStore } from '@/stores/notes'
import TagItem from '@/components/TagItem.vue'
import type { Tag } from '@/types'

const props = defineProps<{
  isOpen?: boolean
  onClose?: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

const notesStore = useNotesStore()
const showColorPicker = ref(false)
const selectedTag = ref<Tag | null>(null)
const isMobile = ref(false)
const isOpen = ref(false)

// Определение мобильного устройства
const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 768
  
  if (!isMobile.value) {
    // На десктопе всегда открыт
    isOpen.value = true
  } else {
    // На мобильных используем значение из props
    isOpen.value = props.isOpen ?? false
  }
}

// Синхронизация с props
watch(() => props.isOpen, (newVal) => {
  if (isMobile.value) {
    isOpen.value = newVal ?? false
  }
}, { immediate: true })

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await notesStore.fetchTags()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Синхронизация с props
const closeSidebar = () => {
  isOpen.value = false
  if (props.onClose) {
    props.onClose()
  }
  emit('close')
}

// Палитра цветов
const colorPalette = [
  null, // Без цвета
  '#FF6B6B', // Красный
  '#4ECDC4', // Бирюзовый
  '#45B7D1', // Голубой
  '#FFA07A', // Светло-лососевый
  '#98D8C8', // Мятный
  '#F7DC6F', // Желтый
  '#BB8FCE', // Фиолетовый
  '#85C1E2', // Светло-голубой
  '#F8B88B', // Персиковый
  '#AED6F1', // Светло-синий
  '#A9DFBF', // Светло-зеленый
  '#F9E79F', // Светло-желтый
  '#D7BDE2', // Светло-фиолетовый
  '#FAD7A0', // Светло-оранжевый
  '#A3E4D7', // Светло-бирюзовый
]

// Загружаем теги при монтировании компонента
onMounted(async () => {
  await notesStore.fetchTags()
})

// Фильтрация тегов по поисковому запросу
const filteredTags = computed(() => {
  if (!notesStore.tagSearchQuery.trim()) {
    return notesStore.tags
  }

  const query = notesStore.tagSearchQuery.toLowerCase()
  return notesStore.tags.filter(tag =>
    tag.name.toLowerCase().includes(query)
  )
})

// Проверка, выбран ли тег
const isTagSelected = (tagId: string): boolean => {
  return notesStore.selectedTags.includes(tagId)
}

// Переключение выбора тега
const toggleTag = (tagId: string) => {
  const index = notesStore.selectedTags.indexOf(tagId)
  if (index > -1) {
    // Убрать тег из выбранных
    notesStore.selectedTags = notesStore.selectedTags.filter(id => id !== tagId)
  } else {
    // Добавить тег в выбранные
    notesStore.selectedTags = [...notesStore.selectedTags, tagId]
  }
}

// Открыть палитру цветов
const openColorPicker = (tag: Tag) => {
  selectedTag.value = tag
  showColorPicker.value = true
}

// Закрыть палитру цветов
const closeColorPicker = () => {
  showColorPicker.value = false
  selectedTag.value = null
}

// Выбрать цвет
const selectColor = async (color: string | null) => {
  if (!selectedTag.value) return
  
  try {
    await notesStore.updateTag(selectedTag.value.id, { color })
    closeColorPicker()
  } catch (error) {
    console.error('Error updating tag color:', error)
  }
}

// Убрать цвет
const removeColor = async () => {
  if (!selectedTag.value) return
  
  try {
    await notesStore.updateTag(selectedTag.value.id, { color: null })
    closeColorPicker()
  } catch (error) {
    console.error('Error removing tag color:', error)
  }
}
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tags-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

/* Мобильная версия - bottom sheet */
@media (max-width: 767px) {
  .tags-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 80vh;
    max-height: 600px;
    border-radius: 16px 16px 0 0;
    border-right: none;
    border-top: 1px solid #e0e0e0;
    transform: translateY(100%);
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  }

  .tags-sidebar.open {
    transform: translateY(0);
  }
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.close-sidebar-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-sidebar-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

@media (min-width: 768px) {
  .close-sidebar-btn {
    display: none;
  }

  .sidebar-overlay {
    display: none;
  }
}

.search-box {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.tags-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.tag-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
}

.tag-item-wrapper:hover {
  background-color: #f5f5f5;
}

.tag-item-wrapper.selected {
  background-color: #e8eaf6;
  border-left: 3px solid #667eea;
}

.tag-item-wrapper.selected:hover {
  background-color: #e1e4f0;
}

.tag-count {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.empty-tags {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.empty-tags p {
  margin: 0;
}

.color-picker-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.tag-item-wrapper:hover .color-picker-btn {
  opacity: 0.6;
}

.color-picker-btn:hover {
  opacity: 1 !important;
}

.color-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.color-picker-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.color-picker-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

@media (max-width: 767px) {
  .color-palette {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .color-picker-content {
    padding: 16px;
  }

  .color-picker-header h3 {
    font-size: 16px;
  }
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: #333;
}

.color-option.active {
  border-color: #667eea;
  border-width: 3px;
}

.color-option:first-child {
  background: #e0e0e0;
  border: 2px solid #ccc;
}

.color-option:first-child:hover {
  background: #d0d0d0;
}

.checkmark {
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.color-picker-actions {
  display: flex;
  justify-content: flex-end;
}

.remove-color-btn {
  background: #f5f5f5;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.remove-color-btn:hover {
  background: #e0e0e0;
}
</style>

