import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/ui/long-text'
import type{  Client } from './schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Calendar } from 'lucide-react'

export const industryOptions = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Education', value: 'Education' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Consulting', value: 'Consulting' },
  { label: 'Other', value: 'Other' },
] as const

interface DateRange {
  from: Date
  to: Date | undefined
}

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

export const createClientsColumns = (permission?: string): ColumnDef<Client>[] => {
  const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'client_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client ID' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap font-medium'>{row.getValue('client_code')}</div>
    ),
    meta: { className: 'max-w-14' },
  },
  {
    id: 'contact_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact Name' />
    ),
    cell: ({ row }) => {
      const { contact_name } = row.original
      return <LongText className='max-w-36 ps-2'>{contact_name}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'contact_email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap'>{row.getValue('contact_email')}</div>
    ),
    meta: { className: 'max-w-48' },
  },
  {
    accessorKey: 'contact_phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('contact_phone') as string | null
      if (!phone) return <div className='ps-2 text-nowrap'>-</div>
      return (
        <div className='ps-2 text-nowrap flex items-center gap-1.5'>
          <span>{phone}</span>
        </div>
      )
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'company_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company' />
    ),
    cell: ({ row }) => {
      const company = row.getValue('company_name') as string | null
      return <LongText className='max-w-36 ps-2'>{company || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'industry',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Industry' />
    ),
    cell: ({ row }) => {
      const industry = row.getValue('industry') as string | null
      return <div >{industry || '-'}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'next_follow_up_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Next Follow-Up' />
    ),
    cell: ({ row }) => {
      const followUp = row.getValue('next_follow_up_at') as string | null
      if (!followUp) return <div className='ps-2 text-muted-foreground'>-</div>
      return (
        <div className='ps-2 text-sm'>
          {formatFollowUpDate(followUp)}
        </div>
      )
    },
    meta: { className: 'max-w-16' },
  },
  {
    accessorKey: 'last_interaction_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Interaction' />
    ),
    cell: ({ row }) => {
      const lastInteraction = row.getValue('last_interaction_at') as string | null
      if (!lastInteraction) return <div className='ps-2 text-muted-foreground'>-</div>
      return (
        <div className='ps-2 text-sm'>
          {formatFollowUpDate(lastInteraction)}
        </div>
      )
    },
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string
      return (
        <div className="flex items-center space-x-1 ps-2">
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
    meta: { className: 'max-w-44' },
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
