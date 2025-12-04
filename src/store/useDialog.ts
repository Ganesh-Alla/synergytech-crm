// store/useSettingsDialog.ts
"use client"

import { create } from "zustand"
import type { User } from "@/components/admin/users/schema"

interface DialogStore {
  currentRow: User | null
  setCurrentRow: (v: User | null) => void
  openDialog:  'AddUser' | 'EditUser' | 'DeleteUser' | null
  setOpenDialog: (v: 'AddUser' | 'EditUser' | 'DeleteUser' | null) => void
}

export const useDialog = create<DialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open) => set({ openDialog: open }),
}))
