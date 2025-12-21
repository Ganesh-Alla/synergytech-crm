import { MoreHorizontal } from 'lucide-react'
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
import type{  User } from '@/components/admin/users/schema'
import type { Lead } from '@/components/executive/leads/schema'
import { useUserDialog } from '@/store/dialogs/useUserDialog'

type DataTableRowActionsProps = {
  row: Row<User | Lead>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  // Check if it's a Lead by checking for lead-specific fields
  const isLead = 'contact_name' in row.original
  const userDialog = useUserDialog()

  const { setOpenDialog: setOpenUserDialog, setCurrentRow: setCurrentUserRow } = userDialog
  
  // For User type, check if super admin
  const isSuperAdmin = !isLead && 'permission' in row.original && row.original.permission === 'super_admin'

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
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentUserRow(row.original as any)
              setOpenUserDialog('EditUser')
            }}
            disabled={isSuperAdmin}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentUserRow(row.original as any)
              setOpenUserDialog('DeleteUser')
            }}
            className='text-red-500!'
            disabled={isSuperAdmin}
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