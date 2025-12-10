import type{  ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/ui/long-text'
import type{  Requirement } from './schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Calendar } from 'lucide-react'

export const requirementStatus = [
  { label: 'New', value: 'new' },
  { label: 'In Discussion', value: 'in_discussion' },
  { label: 'Quoted', value: 'quoted' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Closed', value: 'closed' },
] as const

export const requirementPriority = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
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

const formatRequiredByDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const createRequirementsColumns = (permission?: string): ColumnDef<Requirement>[] => {
  const columns: ColumnDef<Requirement>[] = [
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
    id: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const { title } = row.original
      return <LongText className='max-w-36 ps-2'>{title}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <LongText className='ps-2 text-nowrap'>{row.getValue('description')}</LongText>
    ),
    meta: { className: 'max-w-48' },
  },  
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string | null
      return <LongText className='max-w-36 ps-2'>{status || '-'}</LongText>
    },
    meta: { className: 'max-w-36' },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string | null
      return <div >{priority || '-'}</div>
    },
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'assigned_to_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned To' />
    ),
    cell: ({ row }) => {
      const assignedToName = row.getValue('assigned_to_name') as string | null
      return <div className='ps-2 text-nowrap'>{assignedToName || '-'}</div>
    },
    meta: { className: 'max-w-32' },
  },
  {
    accessorKey: 'required_by_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Required By Date' />
    ),
    cell: ({ row }) => {
      const requiredByDate = row.getValue('required_by_date') as string | null
      if (!requiredByDate) return <div className='ps-2 text-muted-foreground'>-</div>
      return (
        <div className='ps-2 text-sm'>
          {formatRequiredByDate(requiredByDate)}
        </div>
      )
    },
    meta: { className: 'max-w-16' },
  },
  {
    accessorKey: 'estimated_budget',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estimated Budget' />
    ),
    cell: ({ row }) => {
      const estimatedBudget = row.getValue('estimated_budget') as string | null
      if (!estimatedBudget) return <div className='ps-2 text-muted-foreground'>-</div>
      return (
        <div className='ps-2 text-sm'>
          {estimatedBudget}
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
