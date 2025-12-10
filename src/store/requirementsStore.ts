"use client"

import { create } from "zustand"
import type { Requirement, RequirementItem } from "@/components/executive/requirements/schema"
import { toast } from "sonner"
import { useClientsStore } from "./clientsStore"
import { useAuthUserStore } from "./authUserStore"

interface RequirementsStore {
  requirements: Requirement[] | null
  requirementsLoading: boolean
  hasLoaded: boolean

  setRequirements: (v: Requirement[] | null) => void
  loadRequirements: (force?: boolean) => Promise<void>
  addRequirement: (requirement: Requirement, items: RequirementItem[]) => Promise<void>
  updateRequirement: (requirement: Requirement, items: RequirementItem[]) => Promise<void>
  deleteRequirement: (requirementId: string) => Promise<void>
}

export const useRequirementsStore = create<RequirementsStore>((set, get) => ({
  requirements: null,
  requirementsLoading: false,
  hasLoaded: false,

  setRequirements: (requirements) => set({ requirements: requirements }),

  loadRequirements: async (force: boolean = false) => {
    // If forcing, always fetch regardless of current state (data, hasLoaded, or loading)
    if (force) {
      set({ requirementsLoading: true })
    } else {
      // Prevent multiple simultaneous calls
      if (get().requirementsLoading) return
      // If we already have data and it's loaded, don't fetch again
      if (get().requirements && get().hasLoaded) return
      // Only show clientsLoading if we don't have data yet (to avoid flickering)
      const currentRequirements = get().requirements
      const hasData = currentRequirements && currentRequirements.length > 0
      if (!hasData) {
        set({ requirementsLoading: true })
      }
    }
    
    try {
      // Add cache-busting parameter when forcing
      const url = force 
        ? `/api/requirements?t=${Date.now()}` 
        : '/api/requirements'
      const requirementsData = await fetch(url).then(res => res.json())
      const requirements = requirementsData.map((requirement: Requirement) => ({
        ...requirement,
        client_code: useClientsStore.getState().clients?.find(client => client.id === requirement.client_id)?.client_code ?? null,
        assigned_to_name: useAuthUserStore.getState().authUsers?.find(user => user.id === requirement.assigned_to)?.full_name ?? null,
      }))
      set({ requirements: requirements as Requirement[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Requirements:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ requirementsLoading: false })
    }
  },

  addRequirement: async (requirement: Requirement, items: RequirementItem[]) => {
    const toastId = toast.loading("Adding Requirement...");
    try {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, items }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Requirement (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Requirement added successfully", { id: toastId })
      const currentRequirements = get().requirements
      if (currentRequirements && Array.isArray(currentRequirements)) {
        set({ requirements: [data, ...currentRequirements] })
      } else {
        set({ requirements: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Requirement'
      console.error('Error adding Requirement:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateRequirement: async (requirement: Requirement, items: RequirementItem[]) => {
    const toastId = toast.loading("Updating Requirement...");
    try {
      const response = await fetch('/api/requirements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, items }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Requirement (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Requirement updated successfully", { id: toastId })
      const currentRequirements = get().requirements
      if (currentRequirements && Array.isArray(currentRequirements)) {
        set({ 
          requirements: currentRequirements.map(r => r.id === data.id ? data : r)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Requirement'
      console.error('Error updating Requirement:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteRequirement: async (requirementId: string) => {
    const toastId = toast.loading("Deleting Client...");
    try {
      const response = await fetch(`/api/requirements?id=${requirementId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to delete Client (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Requirement deleted successfully", { id: toastId })
      const currentRequirements = get().requirements
      if (currentRequirements && Array.isArray(currentRequirements)) {
        set({ 
          requirements: currentRequirements.filter(r => r.id !== requirementId)
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

export const initRequirementsStore = () => {
  const requirementsStore = useRequirementsStore.getState()
  
  // Only load if we haven't loaded yet
  if (!requirementsStore.hasLoaded) {
    requirementsStore.loadRequirements()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
