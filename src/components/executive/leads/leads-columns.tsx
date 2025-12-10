import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { Badge } from '@/components/ui/badge'
import { LongText } from '@/components/ui/long-text'
import { cn } from '@/lib/utils'
import type{  Lead } from './schema'
import type{  LeadStatus } from './schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Calendar } from 'lucide-react'

export const statusColors = new Map<LeadStatus, string>([
  ['new', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
  ['in_progress', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
  ['incompatible', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
  ['converted', 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'],
  ['not_serviced', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

export const statusOptions = [
  { label: 'New', value: 'new' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Incompatible', value: 'incompatible' },
  { label: 'Not Serviced', value: 'not_serviced' },
  { label: 'Converted', value: 'converted' },
] as const

export const sourceOptions = [
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Event', value: 'event' },
  { label: 'WhatsApp', value: 'whatsapp' },
] as const

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFollowUpDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
interface DateRange {
  from: Date
  to: Date | undefined
}

export const createLeadsColumns = (permission?: string): ColumnDef<Lead>[] => {
  const columns: ColumnDef<Lead>[] = [
  {
    id: 'contact_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact Name' />
    ),
    cell: ({ row }) => {
      const { contact_name } = row.original
      return <LongText className='max-w-36'>{contact_name}</LongText>
    },
    meta: { className: 'w-24' },
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
      if (!phone) return <div className='w-fit ps-2 text-nowrap'>-</div>
      
      
      return (
        <div className='w-fit ps-2 text-nowrap flex items-center gap-1.5'>
          <span>{phone}</span>
        </div>
      )
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
          {formatFollowUpDate(followUp)}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string
      return (
        <div className="flex items-center space-x-1 w-full">
          <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-sm">
            {formatDate(createdAt)}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      // Validate that value is a DateRange object
      if (!value || typeof value !== 'object' || !('from' in value)) {
        return true
      }
      const dateRange = value as DateRange
      if (!dateRange.from || !(dateRange.from instanceof Date)) {
        return true
      }
      
      const createdAt = row.getValue(id) as string
      if (!createdAt) return false
      
      const traceDate = new Date(createdAt)
      if (Number.isNaN(traceDate.getTime())) return false
      
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date()
      toDate.setHours(23, 59, 59, 999)
      
      return traceDate >= fromDate && traceDate <= toDate
    },
    size: 180,
    minSize: 150,
    maxSize: 220,
  },
  ]

  // Only add actions column if permission is not 'read'
  if (permission !== 'read') {
    columns.push({
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} permission={permission} />,
    })
  }

  return columns
}