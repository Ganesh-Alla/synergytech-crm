import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/ui/long-text'
import type{  Expense } from './schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'



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

export const expenseStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const createExpenseColumns = (permission?: string): ColumnDef<Expense>[] => {
  const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'executive_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Executive ID' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap font-medium'>{row.getValue('executive_id')}</div>
    ),
    meta: { className: 'max-w-14' },
  },
  {
    id: 'client_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client ID' />
    ),
    cell: ({ row }) => {
      const { client_id } = row.original
      return <LongText className='max-w-36 ps-2'>{client_id}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'requirement_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Requirement ID' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap'>{row.getValue('requirement_id')}</div>
    ),
    meta: { className: 'max-w-48' },
  },
  {
    accessorKey: 'category_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category Code' />
    ),
    cell: ({ row }) => {
      const categoryCode = row.getValue('category_code') as string | null
      if (!categoryCode) return <div className='ps-2 text-nowrap'>-</div>
      return (
        <div className='ps-2 text-nowrap flex items-center gap-1.5'>
            <span>{categoryCode}</span>
        </div>
      )
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'category_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category ID' />
    ),
    cell: ({ row }) => {
      const categoryId = row.getValue('category_id') as string | null
      return <LongText className='max-w-36 ps-2'>{categoryId || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number | null
      return <div >{amount || '-'}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'currency_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Currency Code' />
    ),
    cell: ({ row }) => {
        const currencyCode = row.getValue('currency_code') as string | null
      if (!currencyCode) return <div className='ps-2 text-muted-foreground'>-</div>
      return <div className='ps-2 text-sm'>{currencyCode}</div>
    },
    meta: { className: 'max-w-16' },
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ row }) => {
          const notes = row.getValue('notes') as string | null
      if (!notes) return <div className='ps-2 text-muted-foreground'>-</div>
      return <div className='ps-2 text-sm'>{notes}</div>
    },
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = expenseStatusOptions.find(option => option.value === status)?.label
      return <Badge variant='outline' className={cn('capitalize', badgeColor)}>{status}</Badge>
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
