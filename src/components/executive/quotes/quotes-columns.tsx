import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/ui/long-text'
import type{  Quote, QuoteStatus } from './schema'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DataTableRowActions } from './data-table-row-actions'



export const quoteStatusColors = new Map<QuoteStatus, string>([
  ['draft', 'bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200'],
  ['sent', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
  ['accepted', 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'],
  ['rejected', 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'],
  ['expired', 'bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200'],
])

export const quoteStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
] as const

export const createQuotesColumns = (permission?: string): ColumnDef<Quote>[] => {
  const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'quote_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Quote Number' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap font-medium'>{row.getValue('quote_number')}</div>
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
    accessorKey: 'client_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client ID' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap'>{row.getValue('client_id')}</div>
    ),
    meta: { className: 'max-w-48' },
  },
  {
    accessorKey: 'currency_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Currency Code' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap'>{row.getValue('currency_code')}</div>
    ),
    meta: { className: 'max-w-36' },
  },
  {
      accessorKey: 'default_margin_pct',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Default Margin %' />
    ),
    cell: ({ row }) => {
        const defaultMarginPct = row.getValue('default_margin_pct') as number | null
      return <LongText className='max-w-36 ps-2'>{defaultMarginPct?.toFixed(2) || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'tax_pct',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax %' />
    ),
    cell: ({ row }) => {
      const taxPct = row.getValue('tax_pct') as number | null
      return <LongText className='max-w-36 ps-2'>{taxPct?.toFixed(2) || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'subtotal_cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subtotal Cost' />
    ),
    cell: ({ row }) => {
      const subtotalCost = row.getValue('subtotal_cost') as number | null
      return <LongText className='max-w-36 ps-2'>{subtotalCost?.toFixed(2) || '-'}</LongText>
    },
    meta: { className: 'max-w-16' },
  },
  {
    accessorKey: 'subtotal_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subtotal Price' />
    ),
    cell: ({ row }) => {
      const subtotalPrice = row.getValue('subtotal_price') as number | null
      return <LongText className='max-w-36 ps-2'>{subtotalPrice?.toFixed(2) || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'tax_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax Amount' />
    ),
    cell: ({ row }) => {
      const taxAmount = row.getValue('tax_amount') as number | null
      return <LongText className='max-w-36 ps-2'>{taxAmount?.toFixed(2) || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: "total_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Price" />
    ),
    cell: ({ row }) => {
      const totalPrice = row.getValue("total_price") as number | null
      return (
        <div className="flex items-center space-x-1 ps-2">
          <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-sm">
            {totalPrice?.toFixed(2) || '-'}
          </span>
        </div>
      )
    },  
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as QuoteStatus
      return <Badge variant='outline' className={cn('capitalize', quoteStatusColors.get(status))}>{status}</Badge>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: "valid_till",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valid Till" />
    ),
    cell: ({ row }) => {
      const validTill = row.getValue("valid_till") as string | null
      return <LongText className='max-w-36 ps-2'>{validTill || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null
      return <LongText className='max-w-36 ps-2'>{notes || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
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
