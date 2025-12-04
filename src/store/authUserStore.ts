"use client"

import { create } from "zustand"
import type { User } from "@/components/admin/users/schema"
import { toast } from "sonner"

interface AuthUserStore {
  authUsers: User[] | null
  authUsersLoading: boolean
  refreshing: boolean
  hasLoaded: boolean

  setAuthUsers: (v: User[] | null) => void
  loadAuthUsers: () => Promise<void>
  addAuthUser: (user: User, password: string) => Promise<void>
  updateAuthUser: (user: User, password?: string) => Promise<void>
  deleteAuthUser: (userId: string) => Promise<void>
}

export const useAuthUserStore = create<AuthUserStore>((set, get) => ({
  authUsers: null,
  authUsersLoading: false,
  refreshing: false,
  hasLoaded: false,

  setAuthUsers: (authUsers) => set({ authUsers: authUsers }),

  loadAuthUsers: async () => {
    // Prevent multiple simultaneous calls
    if (get().authUsersLoading) return
    // If we already have data and it's loaded, don't fetch again
    if (get().authUsers && get().hasLoaded) return
 
    // Only show loading if we don't have data yet
    const currentUsers = get().authUsers
    const hasData = currentUsers && currentUsers.length > 0
    if (!hasData) {
      set({ authUsersLoading: true })
    }
    try {
      const authUsersData = await fetch('/api/auth-users').then(res => res.json())
      set({ authUsers: authUsersData as User[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Auth Users:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ authUsersLoading: false })
    }
  },

  addAuthUser: async (user: User, password: string) => {
    const toastId = toast.loading("Adding User...");
    try {
      const response = await fetch('/api/auth-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add User (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("User added successfully", { id: toastId })
      const currentUsers = get().authUsers
      if (currentUsers && Array.isArray(currentUsers)) {
        set({ authUsers: [data, ...currentUsers] })
      } else {
        set({ authUsers: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add User'
      console.error('Error adding User:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateAuthUser: async (user: User, password?: string) => {
    const toastId = toast.loading("Updating User...");
    try {
      const response = await fetch('/api/auth-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update User (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("User updated successfully", { id: toastId })
      const currentUsers = get().authUsers
      if (currentUsers && Array.isArray(currentUsers)) {
        set({ 
          authUsers: currentUsers.map(u => u.id === data.id ? data : u)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update User'
      console.error('Error updating User:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteAuthUser: async (userId: string) => {
    const toastId = toast.loading("Deleting User...");
    try {
      const response = await fetch(`/api/auth-users?id=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to delete User (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("User deleted successfully", { id: toastId })
      const currentUsers = get().authUsers
      if (currentUsers && Array.isArray(currentUsers)) {
        set({ 
          authUsers: currentUsers.filter(u => u.id !== userId)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete User'
      console.error('Error deleting User:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
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
