"use client"

import { create } from "zustand"
import type { SalesOrder } from "@/components/executive/sales/schema"
import { toast } from "sonner"

interface SalesStore {
  salesOrders: SalesOrder[] | null
  salesOrdersLoading: boolean
  hasLoaded: boolean

  setSalesOrders: (v: SalesOrder[] | null) => void
  loadSalesOrders: (force?: boolean) => Promise<void>
  addSalesOrder: (salesOrder: SalesOrder) => Promise<void>
  updateSalesOrder: (salesOrder: SalesOrder) => Promise<void>
  deleteSalesOrder: (salesOrderId: string) => Promise<void>
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  salesOrders: null,
  salesOrdersLoading: false,
  hasLoaded: false,

  setSalesOrders: (salesOrders) => set({ salesOrders: salesOrders }),

  loadSalesOrders: async (force: boolean = false) => {
    // If forcing, always fetch regardless of current state (data, hasLoaded, or loading)
    if (force) {
      set({ salesOrdersLoading: true })
    } else {
      // Prevent multiple simultaneous calls
      if (get().salesOrdersLoading) return
      // If we already have data and it's loaded, don't fetch again
      if (get().salesOrders && get().hasLoaded) return
      // Only show salesOrdersLoading if we don't have data yet (to avoid flickering)
      const currentSalesOrders = get().salesOrders
      const hasData = currentSalesOrders && currentSalesOrders.length > 0
      if (!hasData) {
        set({ salesOrdersLoading: true })
      }
    }
    
    try {
      // Add cache-busting parameter when forcing
      const url = force 
        ? `/api/sales-orders?t=${Date.now()}` 
        : '/api/sales-orders'
      const salesOrdersData = await fetch(url).then(res => res.json())
      set({ salesOrders: salesOrdersData as SalesOrder[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Sales Orders:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ salesOrdersLoading: false })
    }
  },

  addSalesOrder: async (salesOrder: SalesOrder) => {
    const toastId = toast.loading("Adding Sales Order...");
    try {
      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesOrder }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Sales Order (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Sales Order added successfully", { id: toastId })
      const currentSalesOrders = get().salesOrders
      if (currentSalesOrders && Array.isArray(currentSalesOrders)) {
        set({ salesOrders: [data, ...currentSalesOrders] })
      } else {
        set({ salesOrders: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Sales Order'
      console.error('Error adding Sales Order:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

    updateSalesOrder: async (salesOrder: SalesOrder) => {
    const toastId = toast.loading("Updating Sales Order...");
    try {
      const response = await fetch('/api/sales-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesOrder }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Sales Order (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Sales Order updated successfully", { id: toastId })
      const currentSalesOrders = get().salesOrders
      if (currentSalesOrders && Array.isArray(currentSalesOrders)) {
        set({ 
          salesOrders: currentSalesOrders.map(v => v.id === data.id ? data : v)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Sales Order'
      console.error('Error updating Sales Order:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

    deleteSalesOrder: async (salesOrderId: string) => {
    const toastId = toast.loading("Deleting Sales Order...");
    try {
      const response = await fetch(`/api/sales-orders?id=${salesOrderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to delete Sales Order (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Sales Order deleted successfully", { id: toastId })
      const currentSalesOrders = get().salesOrders
      if (currentSalesOrders && Array.isArray(currentSalesOrders)) {
        set({ 
          salesOrders: currentSalesOrders.filter(v => v.id !== salesOrderId)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete Sales Order'
      console.error('Error deleting Sales Order:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },
}));

export const initSalesStore = () => {
  const salesStore = useSalesStore.getState()
  
  // Only load if we haven't loaded yet
  if (!salesStore.hasLoaded) {
    salesStore.loadSalesOrders()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
