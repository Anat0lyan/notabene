import { defineStore } from 'pinia'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'
import type { Task, TaskStats } from '@/types'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    stats: {
      total: 0,
      completed: 0,
      dueToday: 0,
      overdue: 0,
      upcoming: 0
    } as TaskStats,
    loading: false,
    filter: 'all' as 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'pending',
    sortBy: 'dueDate' as 'dueDate' | 'priority' | 'createdAt' | 'title',
    sortOrder: 'asc' as 'asc' | 'desc'
  }),

  getters: {
    filteredTasks: (state) => {
      let filtered = [...state.tasks]
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Apply filter
      switch (state.filter) {
        case 'completed':
          filtered = filtered.filter(t => t.completed)
          break
        case 'pending':
          filtered = filtered.filter(t => !t.completed)
          break
        case 'today':
          filtered = filtered.filter(t => {
            if (!t.dueDate || t.completed) return false
            const dueDate = new Date(t.dueDate)
            return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          })
          break
        case 'upcoming':
          filtered = filtered.filter(t => {
            if (!t.dueDate || t.completed) return false
            const dueDate = new Date(t.dueDate)
            return dueDate > new Date(today.getTime() + 24 * 60 * 60 * 1000)
          })
          break
        case 'overdue':
          filtered = filtered.filter(t => {
            if (!t.dueDate || t.completed) return false
            return new Date(t.dueDate) < today
          })
          break
      }

      // Sort
      filtered.sort((a, b) => {
        let aVal: any, bVal: any
        
        if (state.sortBy === 'title') {
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
        } else if (state.sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aVal = priorityOrder[a.priority]
          bVal = priorityOrder[b.priority]
        } else if (state.sortBy === 'createdAt') {
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
        } else {
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : 0
        }

        if (state.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      return filtered
    }
  },

  actions: {
    async fetchTasks() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.loading = true
      try {
        const tasksRef = collection(db, 'tasks')
        const q = query(
          tasksRef,
          where('userId', '==', authStore.user.id),
          orderBy('createdAt', 'desc')
        )
        
        const snapshot = await getDocs(q)
        this.tasks = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description || null,
            completed: data.completed || false,
            dueDate: data.dueDate?.toDate() || null,
            priority: data.priority || 'medium',
            noteId: data.noteId || null,
            noteTitle: data.noteTitle || null,
            recurringType: data.recurringType || 'none',
            recurringInterval: data.recurringInterval || 1,
            reminder: data.reminder?.toDate() || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Task
        })

        await this.calculateStats()
      } catch (error: any) {
        console.error('Error fetching tasks:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTasksByNote(noteId: string) {
      const authStore = useAuthStore()
      if (!authStore.user) return []

      try {
        const tasksRef = collection(db, 'tasks')
        const q = query(
          tasksRef,
          where('userId', '==', authStore.user.id),
          where('noteId', '==', noteId),
          orderBy('createdAt', 'desc')
        )
        
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description || null,
            completed: data.completed || false,
            dueDate: data.dueDate?.toDate() || null,
            priority: data.priority || 'medium',
            noteId: data.noteId || null,
            noteTitle: data.noteTitle || null,
            recurringType: data.recurringType || 'none',
            recurringInterval: data.recurringInterval || 1,
            reminder: data.reminder?.toDate() || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Task
        })
      } catch (error: any) {
        console.error('Error fetching tasks by note:', error)
        throw error
      }
    },

    async calculateStats() {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      this.stats = {
        total: this.tasks.length,
        completed: this.tasks.filter(t => t.completed).length,
        dueToday: this.tasks.filter(t => {
          if (!t.dueDate || t.completed) return false
          const dueDate = new Date(t.dueDate)
          return dueDate >= today && dueDate < tomorrow
        }).length,
        overdue: this.tasks.filter(t => {
          if (!t.dueDate || t.completed) return false
          return new Date(t.dueDate) < today
        }).length,
        upcoming: this.tasks.filter(t => {
          if (!t.dueDate || t.completed) return false
          return new Date(t.dueDate) >= tomorrow
        }).length
      }
    },

    async fetchStats() {
      await this.fetchTasks()
      await this.calculateStats()
    },

    async createTask(taskData: {
      title: string
      description?: string
      dueDate?: Date | null
      priority?: 'low' | 'medium' | 'high'
      noteId?: string | null
      recurringType?: 'none' | 'daily' | 'weekly' | 'monthly'
      recurringInterval?: number
      reminder?: Date | null
    }) {
      const authStore = useAuthStore()
      if (!authStore.user) throw new Error('Not authenticated')

      try {
        const taskRef = await addDoc(collection(db, 'tasks'), {
          userId: authStore.user.id,
          title: taskData.title,
          description: taskData.description || null,
          completed: false,
          dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
          priority: taskData.priority || 'medium',
          noteId: taskData.noteId || null,
          noteTitle: null, // Will be populated if needed
          recurringType: taskData.recurringType || 'none',
          recurringInterval: taskData.recurringInterval || 1,
          reminder: taskData.reminder ? Timestamp.fromDate(taskData.reminder) : null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })

        await this.fetchTasks()
        return taskRef.id
      } catch (error: any) {
        console.error('Error creating task:', error)
        throw error
      }
    },

    async updateTask(id: string, updates: Partial<Task>) {
      try {
        const taskRef = doc(db, 'tasks', id)
        const updateData: any = {
          updatedAt: Timestamp.now()
        }

        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.completed !== undefined) updateData.completed = updates.completed
        if (updates.dueDate !== undefined) {
          updateData.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null
        }
        if (updates.priority !== undefined) updateData.priority = updates.priority
        if (updates.noteId !== undefined) updateData.noteId = updates.noteId
        if (updates.recurringType !== undefined) updateData.recurringType = updates.recurringType
        if (updates.recurringInterval !== undefined) updateData.recurringInterval = updates.recurringInterval
        if (updates.reminder !== undefined) {
          updateData.reminder = updates.reminder ? Timestamp.fromDate(updates.reminder) : null
        }

        await updateDoc(taskRef, updateData)
        await this.fetchTasks()
      } catch (error: any) {
        console.error('Error updating task:', error)
        throw error
      }
    },

    async toggleTask(id: string) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        await this.updateTask(id, { completed: !task.completed })
      }
    },

    async deleteTask(id: string) {
      try {
        await deleteDoc(doc(db, 'tasks', id))
        await this.fetchTasks()
      } catch (error: any) {
        console.error('Error deleting task:', error)
        throw error
      }
    }
  }
})
