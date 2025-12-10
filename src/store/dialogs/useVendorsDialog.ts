// store/useVendorsDialog.ts
"use client"

import { create } from "zustand"
import type { Vendor } from "@/components/executive/vendors/schema"

interface VendorsDialogStore {
  currentRow: Vendor | null
  setCurrentRow: (v: Vendor | null) => void
  openDialog:  'AddVendor' | 'EditVendor' | 'DeleteVendor' | null
  setOpenDialog: (v: 'AddVendor' | 'EditVendor' | 'DeleteVendor' | null) => void
}

export const useVendorsDialog = create<VendorsDialogStore>((set) => ({
  currentRow: null,
  setCurrentRow: (row: Vendor | null) => set({ currentRow: row }),
  openDialog: null,
  setOpenDialog: (open: 'AddVendor' | 'EditVendor' | 'DeleteVendor' | null) => set({ openDialog: open }),
}))
