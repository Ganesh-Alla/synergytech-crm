// store/useVendorsDialog.ts
"use client"

import { create } from "zustand"
import type { Expense } from "@/components/executive/expenses/schema"

interface ExpensesDialogStore {
  currentRow: Expense | null
  setCurrentRow: (v: Expense | null) => void
  openDialog:  'AddExpense' | 'EditExpense' | 'DeleteExpense' | null
  setOpenDialog: (v: 'AddExpense' | 'EditExpense' | 'DeleteExpense' | null) => void
}

export const useExpensesDialog = create<ExpensesDialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row: Expense | null) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open: 'AddExpense' | 'EditExpense' | 'DeleteExpense' | null) => set({ openDialog: open }),
}))
