import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/ui/long-text'
import { cn } from '@/lib/utils'
import type{  Client } from './schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const clientsColumns: ColumnDef<Client>[] = [
  {
    accessorKey: 'client_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client Code' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap font-medium'>{row.getValue('client_code')}</div>
    ),
  },
  {
    id: 'contact_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact Name' />
    ),
    cell: ({ row }) => {
      const { contact_name } = row.original
      return <LongText className='max-w-36'>{contact_name}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'contact_email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('contact_email')}</div>
    ),
  },
  {
    accessorKey: 'contact_phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('contact_phone') as string | null
      return <div className='w-fit ps-2 text-nowrap'>{phone || '-'}</div>
    },
  },
  {
    accessorKey: 'company_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company' />
    ),
    cell: ({ row }) => {
      const company = row.getValue('company_name') as string | null
      return <LongText className='max-w-36'>{company || '-'}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'industry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Industry' />
    ),
    cell: ({ row }) => {
      const industry = row.getValue('industry') as string | null
      return <div className='w-fit ps-2 text-nowrap'>{industry || '-'}</div>
    },
  },
  {
    accessorKey: 'next_follow_up_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Next Follow Up' />
    ),
    cell: ({ row }) => {
      const followUp = row.getValue('next_follow_up_at') as string | null
      if (!followUp) return <div className='text-muted-foreground'>-</div>
      return (
        <div className='text-sm'>
          {format(new Date(followUp), 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  {
    accessorKey: 'last_interaction_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Interaction' />
    ),
    cell: ({ row }) => {
      const lastInteraction = row.getValue('last_interaction_at') as string | null
      if (!lastInteraction) return <div className='text-muted-foreground'>-</div>
      return (
        <div className='text-sm'>
          {format(new Date(lastInteraction), 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
