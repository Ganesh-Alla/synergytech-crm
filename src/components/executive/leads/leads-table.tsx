"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { statusOptions, sourceOptions } from './leads-columns'
import { DataTablePagination } from '@/components/data-table/pagination'
import { leadsColumns as columns} from './leads-columns'
import { DataTableToolbar } from '@/components/data-table/data-toolbar'
import { useLeadsStore } from '@/store/leadsStore'
import { AlertCircle, Home, RefreshCw, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'


export function LeadsTable() {
  const router = useRouter()
  const { leads, leadsLoading, hasLoaded } = useLeadsStore()
  const data = leads ?? []
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror users route search schema)
//   const {
//     columnFilters,
//     onColumnFiltersChange,
//     pagination,
//     onPaginationChange,
//     ensurePageInRange,
//   } = useTableUrlState({
//     search,
//     navigate,
//     pagination: { defaultPage: 1, defaultPageSize: 10 },
//     globalFilter: { enabled: false },
//     columnFilters: [
//       // username per-column text filter
//       { columnId: 'username', searchKey: 'username', type: 'string' },
//       { columnId: 'status', searchKey: 'status', type: 'array' },
//       { columnId: 'role', searchKey: 'role', type: 'array' },
//     ],
//   })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

//   useEffect(() => {
//     ensurePageInRange(table.getPageCount())
//   }, [table, ensurePageInRange])

// Loading state - only show if we don't have data yet
if (leadsLoading && !leads) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
          <Skeleton className="h-8 w-[250px]" />
          <div className="flex gap-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="w-full max-w-full min-w-0 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                // Use column header as key if available, otherwise fallback
                const headerKey = typeof column.header === 'string' 
                  ? column.header 
                  : `col-${columns.indexOf(column)}`
                return (
                  <TableHead key={`skeleton-header-${headerKey}`}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, rowIdx) => {
              const rowKey = `skeleton-row-${rowIdx}`
              return (
                <TableRow key={rowKey} className="group">
                  {columns.map((column, colIdx) => {
                    const headerKey = typeof column.header === 'string' 
                      ? column.header 
                      : `col-${colIdx}`
                    return (
                      <TableCell key={`${rowKey}-${headerKey}`}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

// Empty state - only show after loading is complete
if (hasLoaded && data.length === 0) {
  return (
    <div className="w-full space-y-4">
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter leads...'
        searchKey='contact_name'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statusOptions.map((status) => ({ ...status })),
          },
          {
            columnId: 'source',
            title: 'Source',
            options: sourceOptions.map((source) => ({ ...source })),
          },
        ]}
      />
      <div className="w-full max-w-full min-w-0 rounded-md border border-dashed">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2 text-center mb-6">
            <h3 className="text-lg font-semibold">No Leads Found</h3>
            <p className="text-muted-foreground max-w-md text-sm">
              No leads are available to display. Start by adding some leads to get started.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/app')}
              variant="default"
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter leads...'
        searchKey='contact_name'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statusOptions.map((status) => ({ ...status })),
          },
          {
            columnId: 'source',
            title: 'Source',
            options: sourceOptions.map((source) => ({ ...source })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        // header.column.columnDef.meta?.className,
                        // header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        // cell.column.columnDef.meta?.className,
                        // cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-32 text-center'
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your filters to see more results.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}