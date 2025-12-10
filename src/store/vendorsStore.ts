"use client"

import { create } from "zustand"
import type { Vendor } from "@/components/executive/vendors/schema"
import { toast } from "sonner"

interface VendorsStore {
  vendors: Vendor[] | null
  vendorsLoading: boolean
  hasLoaded: boolean

  setVendors: (v: Vendor[] | null) => void
  loadVendors: (force?: boolean) => Promise<void>
  addVendor: (vendor: Vendor) => Promise<void>
  updateVendor: (vendor: Vendor) => Promise<void>
  deleteVendor: (vendorId: string) => Promise<void>
}

export const useVendorsStore = create<VendorsStore>((set, get) => ({
  vendors: null,
  vendorsLoading: false,
  hasLoaded: false,

  setVendors: (vendors) => set({ vendors: vendors }),

  loadVendors: async (force: boolean = false) => {
    // If forcing, always fetch regardless of current state (data, hasLoaded, or loading)
    if (force) {
      set({ vendorsLoading: true })
    } else {
      // Prevent multiple simultaneous calls
      if (get().vendorsLoading) return
      // If we already have data and it's loaded, don't fetch again
      if (get().vendors && get().hasLoaded) return
      // Only show clientsLoading if we don't have data yet (to avoid flickering)
      const currentVendors = get().vendors
      const hasData = currentVendors && currentVendors.length > 0
      if (!hasData) {
        set({ vendorsLoading: true })
      }
    }
    
    try {
      // Add cache-busting parameter when forcing
      const url = force 
        ? `/api/vendors?t=${Date.now()}` 
        : '/api/vendors'
      const vendorsData = await fetch(url).then(res => res.json())
      set({ vendors: vendorsData as Vendor[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Vendors:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ vendorsLoading: false })
    }
  },

  addVendor: async (vendor: Vendor) => {
    const toastId = toast.loading("Adding Vendor...");
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Vendor (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Vendor added successfully", { id: toastId })
      const currentVendors = get().vendors
      if (currentVendors && Array.isArray(currentVendors)) {
        set({ vendors: [data, ...currentVendors] })
      } else {
        set({ vendors: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Vendor'
      console.error('Error adding Vendor:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateVendor: async (vendor: Vendor) => {
    const toastId = toast.loading("Updating Vendor...");
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Vendor (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Vendor updated successfully", { id: toastId })
      const currentVendors = get().vendors
      if (currentVendors && Array.isArray(currentVendors)) {
        set({ 
          vendors: currentVendors.map(v => v.id === data.id ? data : v)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Vendor'
      console.error('Error updating Vendor:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteVendor: async (vendorId: string) => {
    const toastId = toast.loading("Deleting Vendor...");
    try {
      const response = await fetch(`/api/vendors?id=${vendorId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to delete Vendor (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Vendor deleted successfully", { id: toastId })
      const currentVendors = get().vendors
      if (currentVendors && Array.isArray(currentVendors)) {
        set({ 
          vendors: currentVendors.filter(v => v.id !== vendorId)
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

export const initVendorsStore = () => {
  const vendorsStore = useVendorsStore.getState()
  
  // Only load if we haven't loaded yet
  if (!vendorsStore.hasLoaded) {
    vendorsStore.loadVendors()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
