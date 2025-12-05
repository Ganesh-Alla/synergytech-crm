"use client"

import { create } from "zustand"
import type { Lead } from "@/components/executive/leads/schema"
import { toast } from "sonner"

interface LeadsStore {
  leads: Lead[] | null
  leadsLoading: boolean
  refreshing: boolean
  hasLoaded: boolean

  setLeads: (v: Lead[] | null) => void
  loadLeads: () => Promise<void>
  addLead: (lead: Lead) => Promise<void>
  updateLead: (lead: Lead) => Promise<void>
  deleteLead: (leadId: string) => Promise<void>
}

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  leads: null,
  leadsLoading: false,
  refreshing: false,
  hasLoaded: false,

  setLeads: (leads) => set({ leads: leads }),

  loadLeads: async () => {
    // Prevent multiple simultaneous calls
    if (get().leadsLoading) return
    // If we already have data and it's loaded, don't fetch again
    if (get().leads && get().hasLoaded) return
 
    // Only show loading if we don't have data yet
    const currentLeads = get().leads
    const hasData = currentLeads && currentLeads.length > 0
    if (!hasData) {
      set({ leadsLoading: true })
    }
    try {
      const leadsData = await fetch('/api/leads').then(res => res.json())
      set({ leads: leadsData as Lead[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Leads:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ leadsLoading: false })
    }
  },

  addLead: async (lead: Lead) => {
    const toastId = toast.loading("Adding Lead...");
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Lead (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Lead added successfully", { id: toastId })
      const currentLeads = get().leads
      if (currentLeads && Array.isArray(currentLeads)) {
        set({ leads: [data, ...currentLeads] })
      } else {
        set({ leads: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Lead'
      console.error('Error adding Lead:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateLead: async (lead: Lead) => {
    const toastId = toast.loading("Updating Lead...");
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Lead (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Lead updated successfully", { id: toastId })
      const currentLeads = get().leads
      if (currentLeads && Array.isArray(currentLeads)) {
        set({ 
          leads: currentLeads.map(l => l.id === data.id ? data : l)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Lead'
      console.error('Error updating Lead:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteLead: async (leadId: string) => {
    const toastId = toast.loading("Deleting Lead...");
    try {
      const response = await fetch(`/api/leads?id=${leadId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to delete Lead (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Lead deleted successfully", { id: toastId })
      const currentLeads = get().leads
      if (currentLeads && Array.isArray(currentLeads)) {
        set({ 
          leads: currentLeads.filter(l => l.id !== leadId)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete Lead'
      console.error('Error deleting Lead:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },
}));

export const initLeadsStore = () => {
  const leadsStore = useLeadsStore.getState()
  
  // Only load if we haven't loaded yet
  if (!leadsStore.hasLoaded) {
    leadsStore.loadLeads()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
