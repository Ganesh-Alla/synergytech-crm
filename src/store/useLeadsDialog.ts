// store/useLeadsDialog.ts
"use client"

import { create } from "zustand"
import type { Lead } from "@/components/executive/leads/schema"

interface LeadsDialogStore {
  currentRow: Lead | null
  setCurrentRow: (v: Lead | null) => void
  openDialog:  'AddLead' | 'EditLead' | 'DeleteLead' | null
  setOpenDialog: (v: 'AddLead' | 'EditLead' | 'DeleteLead' | null) => void
}

export const useLeadsDialog = create<LeadsDialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open) => set({ openDialog: open }),
}))
