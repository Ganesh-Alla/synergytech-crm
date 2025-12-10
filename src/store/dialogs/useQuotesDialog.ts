// store/useLeadsDialog.ts
"use client"

import { create } from "zustand"
import type { Quote } from "@/components/executive/quotes/schema"

interface QuotesDialogStore {
  currentRow: Quote | null
  setCurrentRow: (v: Quote | null) => void
  openDialog:  'AddQuote' | 'EditQuote' | 'DeleteQuote' | null
  setOpenDialog: (v: 'AddQuote' | 'EditQuote' | 'DeleteQuote' | null) => void
}

export const useQuotesDialog = create<QuotesDialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row: Quote | null) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open: 'AddQuote' | 'EditQuote' | 'DeleteQuote' | null) => set({ openDialog: open }),
}))
