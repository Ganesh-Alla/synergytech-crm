"use client"

import { create } from "zustand"
import type { User } from "@/components/admin/users/schema"

interface AuthUserStore {
  authUsers: User[] | null
  loading: boolean
  refreshing: boolean
  hasLoaded: boolean

  setAuthUsers: (v: User[] | null) => void
  loadAuthUsers: () => Promise<void>
}

export const useAuthUserStore = create<AuthUserStore>((set, get) => ({
  authUsers: null,
  loading: false,
  refreshing: false,
  hasLoaded: false,

  setAuthUsers: (authUsers) => set({ authUsers: authUsers }),

  loadAuthUsers: async () => {
    // Prevent multiple simultaneous calls
    if (get().loading) return
    // If we already have Trace, don't fetch again
    if (get().authUsers && get().hasLoaded) return
    
    set({ loading: true })
    try {
      const authUsersData = await fetch('/api/auth-users').then(res => res.json())
      set({ authUsers: authUsersData as User[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Auth Users:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ loading: false })
    }
  },
}));

export const initAuthUserStore = () => {
  const authUserStore = useAuthUserStore.getState()
  
  // Only load if we haven't loaded yet
  if (!authUserStore.hasLoaded) {
    authUserStore.loadAuthUsers()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
