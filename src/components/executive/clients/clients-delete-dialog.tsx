'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Client } from './schema'
import { useClientsStore } from '@/store/clientsStore'

type ClientDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Client
}

export function ClientsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ClientDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { deleteClient } = useClientsStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.contact_name) return

    try {
      await deleteClient(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      // Error is already handled by the store with toast notifications
      console.error('Error deleting client:', error)
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
          Delete Client
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete the client{' '}
            <span className='font-bold'>{currentRow.client_code}</span> -{' '}
            <span className='font-bold'>{currentRow.contact_name}</span>?
            <br />
            This action will permanently remove this client from the system. This cannot be undone.
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
