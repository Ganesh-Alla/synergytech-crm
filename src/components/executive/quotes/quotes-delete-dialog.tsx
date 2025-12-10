'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Quote } from './schema'
import { useQuotesStore } from '@/store/quotesStore'

type QuotesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Quote
}

export function QuotesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: QuotesDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { deleteQuote } = useQuotesStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.quote_number) return

    try {
      await deleteQuote(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      // Error is already handled by the store with toast notifications
      console.error('Error deleting quote:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.quote_number}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Quote
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the client{' '}
            <span className='font-bold'>{currentRow.quote_number}</span> -{' '}
            <span className='font-bold'>{currentRow.notes}</span>?
            <br />
            This action will permanently remove this quote from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Quote Number:
          </Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter quote number to confirm deletion.'
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
