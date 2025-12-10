// store/useVendorsDialog.ts
"use client"

import { create } from "zustand"
import type { SalesOrder } from "@/components/executive/sales/schema"

interface SalesDialogStore {
  currentRow: SalesOrder | null
  setCurrentRow: (v: SalesOrder | null) => void
  openDialog:  'AddSalesOrder' | 'EditSalesOrder' | 'DeleteSalesOrder' | null
  setOpenDialog: (v: 'AddSalesOrder' | 'EditSalesOrder' | 'DeleteSalesOrder' | null) => void
}

export const useSalesDialog = create<SalesDialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row: SalesOrder | null) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open: 'AddSalesOrder' | 'EditSalesOrder' | 'DeleteSalesOrder' | null) => set({ openDialog: open }),
}))
