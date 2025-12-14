/**
 * Преобразует URL в тексте в кликабельные ссылки
 * @param text - текст для обработки
 * @returns HTML строка с кликабельными ссылками
 */
export function linkifyText(text: string): string {
  if (!text) return ''
  
  // Регулярное выражение для поиска URL
  // Поддерживает http, https, и различные домены (включая youtube.com/shorts)
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g
  
  // Экранируем HTML символы в исходном тексте
  const escapedText = escapeHtml(text)
  
  // Заменяем URL на кликабельные ссылки
  return escapedText.replace(urlRegex, (url) => {
    // Убираем возможные точки и запятые в конце URL
    const cleanUrl = url.replace(/[.,;!?]+$/, '')
    const punctuation = url.slice(cleanUrl.length)
    
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-link">${cleanUrl}</a>${punctuation}`
  })
}

/**
 * Экранирует HTML символы для безопасности
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

