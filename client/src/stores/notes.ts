import { defineStore } from 'pinia'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'
import type { Note, Tag } from '@/types'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    tags: [] as Tag[],
    loading: false,
    searchQuery: '',
    tagSearchQuery: '',
    selectedTags: [] as string[],
    sortBy: 'updatedAt' as 'createdAt' | 'updatedAt' | 'title',
    sortOrder: 'desc' as 'asc' | 'desc',
    showArchived: false,
    showFavorites: false
  }),

  getters: {
    filteredNotes: (state) => {
      let filtered = [...state.notes]

      // Filter by archived status
      if (!state.showArchived) {
        filtered = filtered.filter(note => !note.isArchived)
      }

      // Filter by favorites
      if (state.showFavorites) {
        filtered = filtered.filter(note => note.isFavorite)
      }

      // Filter by search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(note => 
          note.title.toLowerCase().includes(query) ||
          (note.content && note.content.toLowerCase().includes(query))
        )
      }

      // Filter by tag search query
      if (state.tagSearchQuery) {
        const tagQuery = state.tagSearchQuery.toLowerCase()
        filtered = filtered.filter(note => {
          if (!note.tags || note.tags.length === 0) return false
          return note.tags.some(tag => 
            tag.name.toLowerCase().includes(tagQuery)
          )
        })
      }

      // Filter by selected tags
      if (state.selectedTags.length > 0) {
        filtered = filtered.filter(note => {
          if (!note.tags || note.tags.length === 0) return false
          return state.selectedTags.every(tagId => 
            note.tags!.some(tag => tag.id === tagId)
          )
        })
      }

      // Sort
      filtered.sort((a, b) => {
        let aVal: any, bVal: any
        
        if (state.sortBy === 'title') {
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
        } else if (state.sortBy === 'createdAt') {
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
        } else {
          aVal = a.updatedAt.getTime()
          bVal = b.updatedAt.getTime()
        }

        if (state.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      return filtered
    },

    favoriteNotes: (state) => state.notes.filter(note => note.isFavorite && !note.isArchived)
  },

  actions: {
    async fetchNotes() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.loading = true
      try {
        const notesRef = collection(db, 'notes')
        const q = query(
          notesRef,
          where('userId', '==', authStore.user.id)
        )
        
        const snapshot = await getDocs(q)
        const notes = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            content: data.content || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            isArchived: data.isArchived || false,
            isFavorite: data.isFavorite || false,
            tags: data.tags || []
          } as Note
        })

        // Load full tag information
        if (this.tags.length > 0) {
          notes.forEach(note => {
            if (note.tags && note.tags.length > 0) {
              note.tags = note.tags.map((tagRef: any) => {
                const tagId = typeof tagRef === 'string' ? tagRef : tagRef.id
                const fullTag = this.tags.find(t => t.id === tagId)
                return fullTag || { id: tagId, name: tagId, userId: authStore.user!.id, createdAt: new Date() }
              })
            }
          })
        }

        this.notes = notes
      } catch (error: any) {
        console.error('Error fetching notes:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTags() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c901b149-d7f0-4073-b956-292c944df986',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stores/notes.ts:150',message:'fetchTags called',data:{userId:authStore.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      try {
        const tagsRef = collection(db, 'tags')
        // Убираем orderBy из запроса, чтобы избежать необходимости в составном индексе
        // Сортировка будет выполнена на клиенте
        const q = query(
          tagsRef,
          where('userId', '==', authStore.user.id)
        )
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c901b149-d7f0-4073-b956-292c944df986',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stores/notes.ts:160',message:'About to execute Firestore query',data:{hasOrderBy:true,hasWhere:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        const snapshot = await getDocs(q)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c901b149-d7f0-4073-b956-292c944df986',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stores/notes.ts:163',message:'Query executed successfully',data:{docsCount:snapshot.docs.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        this.tags = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            color: data.color || null,
            createdAt: data.createdAt?.toDate() || new Date()
          } as Tag
        })

        // Сортируем на клиенте по дате создания (новые сначала)
        this.tags.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        // Calculate note counts for tags
        this.tags = this.tags.map(tag => ({
          ...tag,
          noteCount: this.notes.filter(note => 
            note.tags?.some(t => t.id === tag.id)
          ).length
        }))
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c901b149-d7f0-4073-b956-292c944df986',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stores/notes.ts:185',message:'Error in fetchTags',data:{errorMessage:error?.message,errorCode:error?.code,isIndexError:error?.code?.includes('index')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error('Error fetching tags:', error)
        throw error
      }
    },

    async createNote(noteData: { title: string; content?: string; tags?: string[] }) {
      const authStore = useAuthStore()
      if (!authStore.user) throw new Error('Not authenticated')

      try {
        // Create or get tags
        const tagIds = await this.ensureTags(noteData.tags || [])

        const noteRef = await addDoc(collection(db, 'notes'), {
          userId: authStore.user.id,
          title: noteData.title,
          content: noteData.content || null,
          isArchived: false,
          isFavorite: false,
          tags: tagIds.map(id => ({ id })),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })

        await this.fetchNotes()
        await this.fetchTags()
        return noteRef.id
      } catch (error: any) {
        console.error('Error creating note:', error)
        throw error
      }
    },

    async updateNote(id: string, updates: Omit<Partial<Note>, 'tags'> & { tags?: string[] }) {
      const authStore = useAuthStore()
      if (!authStore.user) throw new Error('Not authenticated')

      try {
        const noteRef = doc(db, 'notes', id)
        const updateData: any = {
          updatedAt: Timestamp.now()
        }

        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.content !== undefined) updateData.content = updates.content
        if (updates.isArchived !== undefined) updateData.isArchived = updates.isArchived
        if (updates.isFavorite !== undefined) updateData.isFavorite = updates.isFavorite

        if (updates.tags !== undefined) {
          const tagIds = await this.ensureTags(updates.tags)
          updateData.tags = tagIds.map(tagId => ({ id: tagId }))
        }

        await updateDoc(noteRef, updateData)
        await this.fetchNotes()
        await this.fetchTags()
      } catch (error: any) {
        console.error('Error updating note:', error)
        throw error
      }
    },

    async deleteNote(id: string) {
      try {
        await deleteDoc(doc(db, 'notes', id))
        await this.fetchNotes()
        await this.fetchTags()
      } catch (error: any) {
        console.error('Error deleting note:', error)
        throw error
      }
    },

    async toggleFavorite(id: string) {
      const note = this.notes.find(n => n.id === id)
      if (note) {
        await this.updateNote(id, { isFavorite: !note.isFavorite })
      }
    },

    async toggleArchive(id: string) {
      const note = this.notes.find(n => n.id === id)
      if (note) {
        await this.updateNote(id, { isArchived: !note.isArchived })
      }
    },

    async ensureTags(tagNames: string[]): Promise<string[]> {
      const authStore = useAuthStore()
      if (!authStore.user) return []

      const tagIds: string[] = []
      const batch = writeBatch(db)
      let hasMutations = false

      for (const tagName of tagNames) {
        if (!tagName.trim()) continue

        // Check if tag already exists
        let existingTag = this.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase())
        
        if (existingTag) {
          tagIds.push(existingTag.id)
        } else {
          // Create new tag
          const tagRef = doc(collection(db, 'tags'))
          batch.set(tagRef, {
            userId: authStore.user.id,
            name: tagName.trim(),
            color: null,
            createdAt: Timestamp.now()
          })
          tagIds.push(tagRef.id)
          hasMutations = true
        }
      }

      if (hasMutations) {
        await batch.commit()
        await this.fetchTags()
      }

      return tagIds
    },

    async updateTag(id: string, updates: { name?: string; color?: string | null }) {
      try {
        const tagRef = doc(db, 'tags', id)
        await updateDoc(tagRef, updates)
        await this.fetchTags()
      } catch (error: any) {
        console.error('Error updating tag:', error)
        throw error
      }
    },

    async deleteTag(id: string) {
      try {
        // Remove tag from all notes
        const notesWithTag = this.notes.filter(note => 
          note.tags?.some(t => t.id === id)
        )

        const batch = writeBatch(db)
        for (const note of notesWithTag) {
          const noteRef = doc(db, 'notes', note.id)
          const updatedTags = note.tags?.filter(t => t.id !== id) || []
          batch.update(noteRef, { tags: updatedTags })
        }

        // Delete tag
        batch.delete(doc(db, 'tags', id))
        await batch.commit()

        await this.fetchNotes()
        await this.fetchTags()
      } catch (error: any) {
        console.error('Error deleting tag:', error)
        throw error
      }
    }
  }
})
