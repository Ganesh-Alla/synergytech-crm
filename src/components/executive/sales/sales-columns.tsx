import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/ui/long-text'
import type{  SalesOrder } from './schema'
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

export const salesOrderStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const createSalesOrderColumns = (permission?: string): ColumnDef<SalesOrder>[] => {
  const columns: ColumnDef<SalesOrder>[] = [
  {
    accessorKey: 'order_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order Number' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap font-medium'>{row.getValue('order_number')}</div>
    ),
    meta: { className: 'max-w-14' },
  },
  {
    id: 'requirement_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Requirement ID' />
    ),
    cell: ({ row }) => {
      const { requirement_id } = row.original
      return <LongText className='max-w-36 ps-2'>{requirement_id}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'synergy_quote_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Synergy Quote ID' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap'>{row.getValue('synergy_quote_id')}</div>
    ),
    meta: { className: 'max-w-48' },
  },
  {
    accessorKey: 'order_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order Date' />
    ),
    cell: ({ row }) => {
      const orderDate = row.getValue('order_date') as string | null
      if (!orderDate) return <div className='ps-2 text-nowrap'>-</div>
      return (
        <div className='ps-2 text-nowrap flex items-center gap-1.5'>
          <span>{orderDate}</span>
        </div>
      )
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'currency_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Currency Code' />
    ),
    cell: ({ row }) => {
      const currencyCode = row.getValue('currency_code') as string | null
      return <LongText className='max-w-36 ps-2'>{currencyCode || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'total_cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Cost' />
    ),
    cell: ({ row }) => {
      const totalCost = row.getValue('total_cost') as number | null
      return <div >{totalCost || '-'}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'total_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Price' />
    ),
    cell: ({ row }) => {
      const totalPrice = row.getValue('total_price') as number | null
      if (!totalPrice) return <div className='ps-2 text-muted-foreground'>-</div>
      return <div className='ps-2 text-sm'>{totalPrice}</div>
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
      const badgeColor = salesOrderStatusOptions.find(option => option.value === status)?.label
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
