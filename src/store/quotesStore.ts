"use client"

import { create } from "zustand"
import type { Quote } from "@/components/executive/quotes/schema"
import { toast } from "sonner"


interface QuotesStore {
  quotes: Quote[] | null
  quotesLoading: boolean
  hasLoaded: boolean

  setQuotes: (v: Quote[] | null) => void
  loadQuotes: (force?: boolean) => Promise<void>
  addQuote: (quote: Quote) => Promise<void>
  updateQuote: (quote: Quote) => Promise<void>
  deleteQuote: (quoteId: string) => Promise<void>
}
export const useQuotesStore = create<QuotesStore>((set, get) => ({
  quotes: null,
  quotesLoading: false,
  hasLoaded: false,

  setQuotes: (quotes) => set({ quotes: quotes }),

  loadQuotes: async (force: boolean = false) => {
    // If forcing, always fetch regardless of current state (data, hasLoaded, or loading)
    if (force) {
      set({ quotesLoading: true })
    } else {
      // Prevent multiple simultaneous calls
      if (get().quotesLoading) return
      // If we already have data and it's loaded, don't fetch again
      if (get().quotes && get().hasLoaded) return
      // Only show quotesLoading if we don't have data yet (to avoid flickering)
      const currentQuotes = get().quotes
      const hasData = currentQuotes && currentQuotes.length > 0
      if (!hasData) {
        set({ quotesLoading: true })
      }
    }
    
    try {
      // Add cache-busting parameter when forcing
      const url = force 
            ? `/api/quotes?t=${Date.now()}` 
        : '/api/quotes'
      const quotesData = await fetch(url).then(res => res.json())
      set({ quotes: quotesData as Quote[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Quotes:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
      set({ quotesLoading: false })
    }
  },

  addQuote: async (quote: Quote) => {
    const toastId = toast.loading("Adding Quote...");
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Quote (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Quote added successfully", { id: toastId })
      const currentQuotes = get().quotes
      if (currentQuotes && Array.isArray(currentQuotes)) {
        set({ quotes: [data, ...currentQuotes] })
      } else {
        set({ quotes: [data] })
      }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add Quote'
      console.error('Error adding Quote:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateQuote: async (quote: Quote) => {
    const toastId = toast.loading("Updating Quote...");
    try {
      const response = await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Quote (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
        toast.success("Quote updated successfully", { id: toastId })
      const currentQuotes = get().quotes
      if (currentQuotes && Array.isArray(currentQuotes)) {
        set({ 
          quotes: currentQuotes.map(q => q.id === data.id ? data : q)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Quote'
      console.error('Error updating Quote:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteQuote: async (quoteId: string) => {
    const toastId = toast.loading("Deleting Quote...");
    try {
      const response = await fetch(`/api/quotes?id=${quoteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
          const errorMessage = errorData?.error || `Failed to delete Quote (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Quote deleted successfully", { id: toastId })
      const currentQuotes = get().quotes
      if (currentQuotes && Array.isArray(currentQuotes)) {
        set({ 
          quotes: currentQuotes.filter(q => q.id !== quoteId)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete Quote'
      console.error('Error deleting Quote:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },
}));

export const initQuotesStore = () => {
  const quotesStore = useQuotesStore.getState()
  
  // Only load if we haven't loaded yet
  if (!quotesStore.hasLoaded) {
    quotesStore.loadQuotes()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
