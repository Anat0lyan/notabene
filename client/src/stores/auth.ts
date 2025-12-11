import { defineStore } from 'pinia'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    firebaseUser: null as FirebaseUser | null,
    loading: true,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    username: (state) => state.user?.username || ''
  },

  actions: {
    async init() {
      return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            this.firebaseUser = firebaseUser
            await this.loadUserData(firebaseUser.uid)
          } else {
            this.firebaseUser = null
            this.user = null
          }
          this.loading = false
          resolve()
        })
      })
    },

    async loadUserData(uid: string) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          this.user = {
            id: uid,
            username: data.username,
            createdAt: data.createdAt?.toDate() || new Date()
          }
        } else {
          // Create user document if it doesn't exist
          const email = this.firebaseUser?.email || ''
          await this.createUserDocument(uid, email.split('@')[0] || 'user')
        }
      } catch (error: any) {
        console.error('Error loading user data:', error)
        this.error = error.message
      }
    },

    async createUserDocument(uid: string, username: string) {
      try {
        await setDoc(doc(db, 'users', uid), {
          username,
          createdAt: serverTimestamp()
        })
        this.user = {
          id: uid,
          username,
          createdAt: new Date()
        }
      } catch (error: any) {
        console.error('Error creating user document:', error)
        throw error
      }
    },

    async login(email: string, password: string) {
      try {
        this.error = null
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        await this.loadUserData(userCredential.user.uid)
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async register(email: string, password: string, username: string) {
      try {
        this.error = null
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await this.createUserDocument(userCredential.user.uid, username)
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.firebaseUser = null
      } catch (error: any) {
        console.error('Error logging out:', error)
        this.error = error.message
      }
    }
  }
})
