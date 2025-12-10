'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { SalesOrder } from './schema'
import { useSalesStore } from '@/store/salesStore'

type SalesOrderDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: SalesOrder
}

export function SalesOrderDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: SalesOrderDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { deleteSalesOrder } = useSalesStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.order_number) return

    try {
      await deleteSalesOrder(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      // Error is already handled by the store with toast notifications
      console.error('Error deleting sales order:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.order_number}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Sales Order
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the sales order{' '}
            <span className='font-bold'>{currentRow.order_number}</span>?
            <br />
            This action will permanently remove this sales order from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Order Number:
          </Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter order number to confirm deletion.'
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
