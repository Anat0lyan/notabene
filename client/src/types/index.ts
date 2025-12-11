export interface User {
  id: string
  username: string
  createdAt: Date
}

export interface Note {
  id: string
  userId: string
  title: string
  content?: string | null
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
  isFavorite: boolean
  tags?: Tag[]
}

export interface Tag {
  id: string
  userId: string
  name: string
  color?: string | null
  createdAt: Date
  noteCount?: number
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string | null
  completed: boolean
  dueDate?: Date | null
  priority: 'low' | 'medium' | 'high'
  noteId?: string | null
  noteTitle?: string | null
  recurringType: 'none' | 'daily' | 'weekly' | 'monthly'
  recurringInterval: number
  reminder?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface TaskStats {
  total: number
  completed: number
  dueToday: number
  overdue: number
  upcoming: number
}
