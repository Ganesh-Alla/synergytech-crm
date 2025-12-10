'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Expense } from './schema'
import { useExpensesStore } from '@/store/expensesStore'

type ExpenseDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Expense
}

export function ExpenseDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ExpenseDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { deleteExpense } = useExpensesStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.id) return

    try {
      await deleteExpense(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      // Error is already handled by the store with toast notifications
      console.error('Error deleting expense:', error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.id}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Expense
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the expense{' '}
            <span className='font-bold'>{currentRow.id}</span>?
            <br />
            This action will permanently remove this expense from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Expense ID:
          </Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter expense id to confirm deletion.'
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
