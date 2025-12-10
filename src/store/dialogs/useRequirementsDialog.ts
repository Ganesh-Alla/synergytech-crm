"use client"

import { create } from "zustand"
import type { Requirement } from "@/components/executive/requirements/schema"

interface RequirementsDialogStore {
  currentClientId: string | null
  currentRow: Requirement | null
  setCurrentRow: (v: Requirement | null) => void
  setCurrentClientId: (v: string | null) => void
  openDialog:  'AddRequirement' | 'EditRequirement' | 'DeleteRequirement' | null
  setOpenDialog: (v: 'AddRequirement' | 'EditRequirement' | 'DeleteRequirement' | null) => void
}

export const useRequirementsDialog = create<RequirementsDialogStore>((set) => ({
  currentClientId: null,
  currentRow: null,
  setCurrentRow: (row: Requirement | null) => set({ currentRow: row }),
  setCurrentClientId: (clientId: string | null) => set({ currentClientId: clientId }),
  openDialog: null,
  setOpenDialog: (open: 'AddRequirement' | 'EditRequirement' | 'DeleteRequirement' | null) => set({ openDialog: open }),
}))
