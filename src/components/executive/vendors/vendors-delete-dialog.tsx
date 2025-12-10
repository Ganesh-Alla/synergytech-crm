'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Vendor } from './schema'
import { useVendorsStore } from '@/store/vendorsStore'

type VendorDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Vendor
}

export function VendorsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: VendorDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { deleteVendor } = useVendorsStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.contact_name) return

    try {
      await deleteVendor(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      // Error is already handled by the store with toast notifications
      console.error('Error deleting vendor:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.contact_name}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Vendor
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the client{' '}
            <span className='font-bold'>{currentRow.vendor_code}</span> -{' '}
            <span className='font-bold'>{currentRow.contact_name}</span>?
            <br />
            This action will permanently remove this vendor from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Contact Name:
          </Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter contact name to confirm deletion.'
            />

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
