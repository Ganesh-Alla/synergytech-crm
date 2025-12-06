import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'
import { LongText } from '@/components/ui/long-text'
import { cn } from '@/lib/utils'
import type{  Lead } from './schema'
import type{  LeadStatus } from './schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const statusColors = new Map<LeadStatus, string>([
  ['new', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
  ['in_progress', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
  ['won', 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'],
  ['lost', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

export const statusOptions = [
  { label: 'New', value: 'new' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
] as const

export const sourceOptions = [
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Event', value: 'event' },
  { label: 'WhatsApp', value: 'whatsapp' },
] as const

export const leadsColumns: ColumnDef<Lead>[] = [
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
    accessorKey: 'client_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client Code' />
    ),
    cell: ({ row }) => {
      const clientCode = row.getValue('client_code') as string | null
      return <div className='w-fit ps-2 text-nowrap font-medium'>{clientCode || '-'}</div>
    },
  },
  {
    accessorKey: 'assigned_to_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned To' />
    ),
    cell: ({ row }) => {
      const assignedToName = row.getValue('assigned_to_name') as string | null
      return <div className='w-fit ps-2 text-nowrap'>{assignedToName || '-'}</div>
    },
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source' />
    ),
    cell: ({ row }) => {
      const source = row.getValue('source') as string
      return (
        <Badge variant='outline' className='capitalize'>
          {source}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = statusColors.get(status as LeadStatus)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {row.getValue('status')}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'follow_up_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Follow Up' />
    ),
    cell: ({ row }) => {
      const followUp = row.getValue('follow_up_at') as string | null
      if (!followUp) return <div className='text-muted-foreground'>-</div>
      return (
        <div className='text-sm'>
          {format(new Date(followUp), 'MMM dd, yyyy')}
        </div>
      )
    },
  },{
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string | null
      return <LongText className='max-w-36'>{notes || '-'}</LongText>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]