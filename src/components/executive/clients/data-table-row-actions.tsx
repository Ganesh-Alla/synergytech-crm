import { FilePlus, MoreHorizontal, Plus } from 'lucide-react'
import type{  Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Client } from './schema'
import { useClientsDialog } from '@/store/dialogs/useClientsDialog'
import { useRequirementsDialog } from '@/store/dialogs/useRequirementsDialog'
import Link from 'next/link'

type DataTableRowActionsProps = {
  row: Row<Client>
  permission?: string
}

export function DataTableRowActions({ row, permission }: DataTableRowActionsProps) {
  const { setOpenDialog, setCurrentRow } = useClientsDialog()
  const { setOpenDialog: setOpenRequirementDialog, setCurrentClientId, currentClientId } = useRequirementsDialog()
  const canDelete = permission === 'full_access'

  return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-full'>
          <DropdownMenuItem
            asChild
          >
            <Link className='space-x-1' href={`/app/requirements/new?clientId=${row.original.id}`}>
              <span>Add Requirement</span> 
            <DropdownMenuShortcut>
              <FilePlus size={16} />
            </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpenDialog('EditClient')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpenDialog('DeleteClient')
            }}
            className='text-red-500!'
            disabled={!canDelete}
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
