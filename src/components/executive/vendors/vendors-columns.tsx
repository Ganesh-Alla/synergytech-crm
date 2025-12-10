import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/ui/long-text'
import type{  Vendor, VendorStatus } from './schema'
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

export const vendorStatusColors = new Map<VendorStatus, string>([
  ['active', 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'],
  ['inactive', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

export const vendorStatusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
] as const

export const createVendorsColumns = (permission?: string): ColumnDef<Vendor>[] => {
  const columns: ColumnDef<Vendor>[] = [
  {
    accessorKey: 'vendor_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor ID' />
    ),
    cell: ({ row }) => (
      <div className='ps-2 text-nowrap font-medium'>{row.getValue('vendor_code')}</div>
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
    accessorKey: 'gst_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='GST Number' />
    ),
    cell: ({ row }) => {
      const gstNumber = row.getValue('gst_number') as string | null
      return <div >{gstNumber || '-'}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ row }) => {
      const address = row.getValue('address') as string | null
      if (!address) return <div className='ps-2 text-muted-foreground'>-</div>
      return <div className='ps-2 text-sm'>{address}</div>
    },
    meta: { className: 'max-w-16' },
  },
  {
    accessorKey: 'payment_terms',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Terms' />
    ),
    cell: ({ row }) => {
      const paymentTerms = row.getValue('payment_terms') as string | null
      if (!paymentTerms) return <div className='ps-2 text-muted-foreground'>-</div>
      return <div className='ps-2 text-sm'>{paymentTerms}</div>
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
      const badgeColor = vendorStatusColors.get(status as VendorStatus)
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
