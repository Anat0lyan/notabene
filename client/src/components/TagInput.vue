<template>
  <div class="tag-input">
    <div class="tags-list">
      <span
        v-for="tag in selectedTags"
        :key="tag"
        class="tag-badge"
      >
        {{ tag }}
        <button @click="removeTag(tag)" class="remove-tag">×</button>
      </span>
      <input
        v-model="inputValue"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
        type="text"
        placeholder="Добавить тег..."
        class="tag-input-field"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selectedTags = ref([...props.modelValue])
const inputValue = ref('')
const lastDeleted = ref<string | null>(null)

watch(() => props.modelValue, (newVal) => {
  selectedTags.value = [...newVal]
})

const addTag = () => {
  const tag = inputValue.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    emit('update:modelValue', [...selectedTags.value])
  }
  inputValue.value = ''
  lastDeleted.value = null
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
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 40px;
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
}

.remove-tag:hover {
  color: #333;
}

.tag-input-field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  min-width: 120px;
}
</style>
