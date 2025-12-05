// store/useClientsDialog.ts
"use client"

import { create } from "zustand"
import type { Client } from "@/components/executive/clients/schema"

interface ClientsDialogStore {
  currentRow: Client | null
  setCurrentRow: (v: Client | null) => void
  openDialog:  'AddClient' | 'EditClient' | 'DeleteClient' | null
  setOpenDialog: (v: 'AddClient' | 'EditClient' | 'DeleteClient' | null) => void
}

export const useClientsDialog = create<ClientsDialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open) => set({ openDialog: open }),
}))
