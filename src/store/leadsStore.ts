"use client"

import { create } from "zustand"
import { toast } from "sonner"
import { useAuthUserStore } from "./authUserStore"
import type { Lead } from "@/components/executive/leads/schema"

// Re-export Lead type for convenience
export type { Lead }

interface LeadsStore {
  leads: Lead[] | null
  leadsLoading: boolean
  hasLoaded: boolean

  setLeads: (v: Lead[] | null) => void
  loadLeads: (force?: boolean) => Promise<void>
  addLead: (lead: Lead) => Promise<void>
  updateLead: (lead: Lead) => Promise<void>
  deleteLead: (leadId: string) => Promise<void>
}

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  leads: null,
  leadsLoading: false,
  hasLoaded: false,

  setLeads: (leads) => set({ leads: leads }),

  loadLeads: async (force: boolean = false) => {
    // If forcing, always fetch regardless of current state (data, hasLoaded, or loading)
    if (force) {
      set({ leadsLoading: true })
    } else {
      // Prevent multiple simultaneous calls
      if (get().leadsLoading) return
      // If we already have data and it's loaded, don't fetch again
      if (get().leads && get().hasLoaded) return
      // Only show loading if we don't have data yet (to avoid flickering)
      const currentLeads = get().leads
      const hasData = currentLeads && currentLeads.length > 0
      if (!hasData) {
        set({ leadsLoading: true })
      }
    }
    try {
      // Add cache-busting parameter when forcing
      const url = force 
        ? `/api/leads?t=${Date.now()}` 
        : '/api/leads'
      const leads = await fetch(url).then(res => res.json())
      const leadsData = leads.map((lead: Lead) => ({
        ...lead,
        assigned_to_name: useAuthUserStore.getState().authUsers?.find(user => user.id === lead.assigned_to)?.full_name ?? null,
      }))
      console.log('leadsData', leadsData)
      set({ leads: leadsData, hasLoaded: true })
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
      if(data.message === "Success"){
        toast.success("Lead added successfully", { id: toastId })
        const currentLeads = get().leads
        if (currentLeads && Array.isArray(currentLeads)) {
          set({ leads: [{...lead, assigned_to_name: useAuthUserStore.getState().authUsers?.find(user => user.id === lead.assigned_to)?.full_name ?? null}, ...currentLeads] })
        } else {
          set({ leads: [{...lead, assigned_to_name: useAuthUserStore.getState().authUsers?.find(user => user.id === lead.assigned_to)?.full_name ?? null}] })
        }
      }
      else{
        const errorMessage = data.error || `Failed to add Lead (${response.status})`
        throw new Error(errorMessage)
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
      console.log('data', data)
      if(data.message === "Success"){
      toast.success("Lead updated successfully", { id: toastId })
        const currentLeads = get().leads
        if (currentLeads && Array.isArray(currentLeads)) {
          set({
            leads: currentLeads.map(l => {
              if (l.id !== lead.id) return l;
              // Check if assigned_to changed
              let assigned_to_name = l.assigned_to_name;
              if (l.assigned_to !== lead.assigned_to) {
                assigned_to_name = useAuthUserStore.getState().authUsers?.find(user => user.id === lead.assigned_to)?.full_name ?? null;
              }
              return {
                ...lead,
                assigned_to_name
              };
            })
          })
        }
      }
      else{
        const errorMessage = data.error || `Failed to update Lead (${response.status})`
        throw new Error(errorMessage)
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
  // Note: This assumes authUserStore is already loaded (handled by LeadsStoreInitializer)
  if (!leadsStore.hasLoaded) {
    leadsStore.loadLeads()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
