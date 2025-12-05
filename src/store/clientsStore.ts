"use client"

import { create } from "zustand"
import type { Client } from "@/components/executive/clients/schema"
import { toast } from "sonner"

interface ClientsStore {
  clients: Client[] | null
  clientsLoading: boolean
  refreshing: boolean
  hasLoaded: boolean

  setClients: (v: Client[] | null) => void
  loadClients: () => Promise<void>
  addClient: (client: Client) => Promise<void>
  updateClient: (client: Client) => Promise<void>
  deleteClient: (clientId: string) => Promise<void>
}

export const useClientsStore = create<ClientsStore>((set, get) => ({
  clients: null,
  clientsLoading: false,
  refreshing: false,
  hasLoaded: false,

  setClients: (clients) => set({ clients: clients }),

  loadClients: async () => {
    // Prevent multiple simultaneous calls
    if (get().clientsLoading) return
    // If we already have data and it's loaded, don't fetch again
    if (get().clients && get().hasLoaded) return
 
    // Only show loading if we don't have data yet
    const currentClients = get().clients
    const hasData = currentClients && currentClients.length > 0
    if (!hasData) {
      set({ clientsLoading: true })
    }
    try {
      const clientsData = await fetch('/api/clients').then(res => res.json())
      set({ clients: clientsData as Client[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Clients:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ clientsLoading: false })
    }
  },

  addClient: async (client: Client) => {
    const toastId = toast.loading("Adding Client...");
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Client (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Client added successfully", { id: toastId })
      const currentClients = get().clients
      if (currentClients && Array.isArray(currentClients)) {
        set({ clients: [data, ...currentClients] })
      } else {
        set({ clients: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Client'
      console.error('Error adding Client:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateClient: async (client: Client) => {
    const toastId = toast.loading("Updating Client...");
    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Client (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Client updated successfully", { id: toastId })
      const currentClients = get().clients
      if (currentClients && Array.isArray(currentClients)) {
        set({ 
          clients: currentClients.map(c => c.id === data.id ? data : c)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Client'
      console.error('Error updating Client:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteClient: async (clientId: string) => {
    const toastId = toast.loading("Deleting Client...");
    try {
      const response = await fetch(`/api/clients?id=${clientId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to delete Client (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Client deleted successfully", { id: toastId })
      const currentClients = get().clients
      if (currentClients && Array.isArray(currentClients)) {
        set({ 
          clients: currentClients.filter(c => c.id !== clientId)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete Client'
      console.error('Error deleting Client:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },
}));

export const initClientsStore = () => {
  const clientsStore = useClientsStore.getState()
  
  // Only load if we haven't loaded yet
  if (!clientsStore.hasLoaded) {
    clientsStore.loadClients()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
