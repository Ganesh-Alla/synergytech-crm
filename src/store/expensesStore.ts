"use client"

import { create } from "zustand"
import type { Expense } from "@/components/executive/expenses/schema"
import { toast } from "sonner"

interface ExpensesStore {
  expenses: Expense[] | null
  expensesLoading: boolean
  hasLoaded: boolean

  setExpenses: (v: Expense[] | null) => void
  loadExpenses: (force?: boolean) => Promise<void>
  addExpense: (expense: Expense) => Promise<void>
  updateExpense: (expense: Expense) => Promise<void>
  deleteExpense: (expenseId: string) => Promise<void>
}

export const useExpensesStore = create<ExpensesStore>((set, get) => ({
  expenses: null,
  expensesLoading: false,
  hasLoaded: false,

  setExpenses: (expenses) => set({ expenses: expenses }),

  loadExpenses: async (force: boolean = false) => {
    // If forcing, always fetch regardless of current state (data, hasLoaded, or loading)
    if (force) {
      set({ expensesLoading: true })
    } else {
      // Prevent multiple simultaneous calls
      if (get().expensesLoading) return
      // If we already have data and it's loaded, don't fetch again
      if (get().expenses && get().hasLoaded) return
      // Only show clientsLoading if we don't have data yet (to avoid flickering)
      const currentExpenses = get().expenses
      const hasData = currentExpenses && currentExpenses.length > 0
      if (!hasData) {
        set({ expensesLoading: true })
      }
    }
    
    try {
      // Add cache-busting parameter when forcing
      const url = force 
        ? `/api/expenses?t=${Date.now()}` 
        : '/api/expenses'
      const expensesData = await fetch(url).then(res => res.json())
      set({ expenses: expensesData as Expense[], hasLoaded: true })
    } catch (error) {
      console.error('Error loading Expenses:', error)
      set({ hasLoaded: true }) // Mark as loaded even on error to prevent retries
    } finally {
        set({ expensesLoading: false })
    }
  },

  addExpense: async (expense: Expense) => {
    const toastId = toast.loading("Adding Expense...");
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expense }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to add Expense (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Expense added successfully", { id: toastId })
      const currentExpenses = get().expenses
      if (currentExpenses && Array.isArray(currentExpenses)) {
        set({ expenses: [data, ...currentExpenses] })
      } else {
        set({ expenses: [data] })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add Expense'
      console.error('Error adding Expense:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  updateExpense: async (expense: Expense) => {
    const toastId = toast.loading("Updating Expense...");
    try {
      const response = await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expense }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        const errorMessage = errorData?.error || `Failed to update Expense (${response.status})`
        throw new Error(errorMessage)
      }
      const data = await response.json()
      toast.success("Expense updated successfully", { id: toastId })
      const currentExpenses = get().expenses
      if (currentExpenses && Array.isArray(currentExpenses)) {
        set({ 
          expenses: currentExpenses.map(v => v.id === data.id ? data : v)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Expense'
      console.error('Error updating Expense:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },

  deleteExpense: async (expenseId: string) => {
    const toastId = toast.loading("Deleting Expense...");
    try {
      const response = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
          const errorMessage = errorData?.error || `Failed to delete Expense (${response.status})`
        throw new Error(errorMessage)
      }
      toast.success("Expense deleted successfully", { id: toastId })
      const currentExpenses = get().expenses
      if (currentExpenses && Array.isArray(currentExpenses)) {
        set({ 
          expenses: currentExpenses.filter(v => v.id !== expenseId)
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete Expense'
      console.error('Error deleting Expense:', errorMessage)
      toast.error(errorMessage, { id: toastId })
      throw error
    }
  },
}));

export const initExpensesStore = () => {
  const expensesStore = useExpensesStore.getState()
  
  // Only load if we haven't loaded yet
  if (!expensesStore.hasLoaded) {
    expensesStore.loadExpenses()
  }
  
  return () => {
    // No cleanup needed without persistence
  }
}
