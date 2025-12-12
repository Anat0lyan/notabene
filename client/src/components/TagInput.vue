<template>
  <div class="tag-input" :class="{ 'has-focus': showSuggestions }">
    <!-- Поле ввода с кнопкой -->
    <div class="input-container-wrapper">
      <div class="input-container">
        <input
          v-model="inputValue"
          @keydown.enter.prevent="addTag"
          @keydown.arrow-down.prevent="selectNextSuggestion"
          @keydown.arrow-up.prevent="selectPrevSuggestion"
          @keydown.escape="hideSuggestions"
          @keydown.backspace="handleBackspace"
          @focus="showSuggestions = true"
          @blur="handleBlur"
          @input="handleInput"
          type="text"
          placeholder="Введите тег..."
          class="tag-input-field"
        />
        <button
          v-if="inputValue.trim()"
          type="button"
          @click="addTag"
          class="add-tag-btn"
          title="Добавить тег"
        >
          +
        </button>
      </div>
      
      <!-- Выпадающий список существующих тегов -->
      <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-dropdown">
        <div
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion"
          class="suggestion-item"
          :class="{ 'selected': index === selectedSuggestionIndex }"
          @mousedown.prevent="selectSuggestion(suggestion)"
          @mouseenter="selectedSuggestionIndex = index"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>

    <!-- Список выбранных тегов -->
    <div v-if="selectedTags.length > 0" class="tags-container">
      <span
        v-for="tag in selectedTags"
        :key="tag"
        class="tag-badge"
      >
        {{ tag }}
        <button @click="removeTag(tag)" class="remove-tag">×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const notesStore = useNotesStore()
const selectedTags = ref([...props.modelValue])
const inputValue = ref('')
const lastDeleted = ref<string | null>(null)
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

watch(() => props.modelValue, (newVal) => {
  selectedTags.value = [...newVal]
})

// Получаем список всех существующих тегов
const existingTags = computed(() => {
  return notesStore.tags.map(tag => tag.name)
})

// Фильтруем предложения на основе ввода
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) {
    // Если поле пустое, показываем все теги, которых еще нет в выбранных
    return existingTags.value.filter(tag => !selectedTags.value.includes(tag))
  }
  
  const query = inputValue.value.toLowerCase().trim()
  return existingTags.value.filter(tag => 
    !selectedTags.value.includes(tag) &&
    tag.toLowerCase().includes(query)
  )
})

const handleInput = () => {
  showSuggestions.value = true
  selectedSuggestionIndex.value = -1
}

const handleBlur = () => {
  // Небольшая задержка, чтобы клик по предложению успел сработать
  setTimeout(() => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }, 200)
}

const hideSuggestions = () => {
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

const selectSuggestion = (tag: string) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    emit('update:modelValue', [...selectedTags.value])
  }
  inputValue.value = ''
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

const selectNextSuggestion = () => {
  if (filteredSuggestions.value.length > 0) {
    selectedSuggestionIndex.value = Math.min(
      selectedSuggestionIndex.value + 1,
      filteredSuggestions.value.length - 1
    )
  }
}

const selectPrevSuggestion = () => {
  selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
}

const addTag = () => {
  const tag = inputValue.value.trim()
  
  // Если выбран элемент из списка предложений, используем его
  if (selectedSuggestionIndex.value >= 0 && filteredSuggestions.value[selectedSuggestionIndex.value]) {
    selectSuggestion(filteredSuggestions.value[selectedSuggestionIndex.value])
    return
  }
  
  // Иначе добавляем новый тег
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    emit('update:modelValue', [...selectedTags.value])
  }
  inputValue.value = ''
  lastDeleted.value = null
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
  emit('update:modelValue', [...selectedTags.value])
}

const handleBackspace = () => {
  if (inputValue.value === '' && selectedTags.value.length > 0) {
    if (lastDeleted.value) {
      removeTag(lastDeleted.value)
      lastDeleted.value = null
    } else {
      lastDeleted.value = selectedTags.value[selectedTags.value.length - 1]
    }
  }
}
</script>

<style scoped>
.tag-input {
  width: 100%;
  position: relative;
}

/* Обертка для контейнера ввода и выпадающего списка */
.input-container-wrapper {
  position: relative;
  width: 100%;
}

/* Контейнер для поля ввода и кнопки */
.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.2s;
}

/* На мобильных - рамка меняет цвет при фокусе */
.tag-input.has-focus .input-container {
  border-color: #667eea;
}


.tag-input-field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  min-width: 120px;
}

.add-tag-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.add-tag-btn:hover {
  background: #5568d3;
}

.add-tag-btn:active {
  background: #4a5bc4;
}

/* Контейнер для тегов - на мобильных отображается снизу */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 0;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e0e0e0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
}

.remove-tag {
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.remove-tag:hover {
  color: #333;
}

/* На десктопе (ширина больше 768px) - все в одной строке */
@media (min-width: 768px) {
  .tag-input {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: border-color 0.2s;
  }

  .tag-input.has-focus {
    border-color: #667eea;
  }

  .input-container-wrapper {
    flex: 1;
    min-width: 200px;
  }

  .input-container {
    padding: 0;
    border: none;
    gap: 8px;
  }

  .tags-container {
    margin-top: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.suggestion-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background-color: #f5f5f5;
}

.suggestion-item:first-child {
  border-radius: 8px 8px 0 0;
}

.suggestion-item:last-child {
  border-radius: 0 0 8px 8px;
}
</style>
