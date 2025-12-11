<template>
  <span
    class="tag-item"
    :style="{ backgroundColor: tag.color || '#e0e0e0', color: getTextColor(tag.color) }"
  >
    {{ tag.name }}
  </span>
</template>

<script setup lang="ts">
import type { Tag } from '@/types'

defineProps<{
  tag: Tag
}>()

const getTextColor = (bgColor: string | null | undefined): string => {
  if (!bgColor) return '#333'
  
  // Simple contrast calculation
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 128 ? '#333' : '#fff'
}
</script>

<style scoped>
.tag-item {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
