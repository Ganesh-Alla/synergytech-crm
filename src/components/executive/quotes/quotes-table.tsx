"use client"
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  type Row,
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
import { DataTablePagination } from '@/components/data-table/pagination'
import { useUserStore } from '@/store/userStore'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { DataTableViewOptions } from '@/components/data-table/view-options'
import { AlertCircle, Home, RefreshCw, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/data-table/date-filter'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { Quote } from './schema'
import { Calendar, Mail, Phone, User, Building2, FileText, Globe, Briefcase } from 'lucide-react'
import { useQuotesStore } from '@/store/quotesStore'
import { createQuotesColumns, quoteStatusOptions } from './quotes-columns'

interface DateRange {
  from: Date
  to: Date | undefined
}


export function QuotesTable() {
  const router = useRouter()
  const { quotes, quotesLoading, hasLoaded } = useQuotesStore()
  const { user } = useUserStore()
  const data = useMemo(() => quotes ?? [], [quotes])
  const columns = useMemo(() => createQuotesColumns(user?.permission), [user?.permission])
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [searchField, setSearchField] = useState<keyof Quote>("quote_number")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Custom global filter function to search by selected field
  const globalFilterFn = (row: Row<Quote>, _columnId: string, filterValue: string) => {
    if (!filterValue) return true
    
    const searchValue = filterValue.toLowerCase().trim()
    const quote = row.original
    const fieldValue = quote[searchField]
    
    // Handle null/undefined values
    if (!fieldValue) return false
    
    // Convert to string and search
    return String(fieldValue).toLowerCase().includes(searchValue)
  }

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
      globalFilter,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Update created_at filter when date range changes
  useEffect(() => {
    setColumnFilters((prevFilters) => {
      const createdAtIndex = prevFilters.findIndex(f => f.id === 'created_at')
      if (dateRange) {
        if (createdAtIndex === -1) {
          return [...prevFilters, { id: 'created_at', value: dateRange }]
        } else {
          // Update existing filter
          const newFilters = [...prevFilters]
          newFilters[createdAtIndex] = { id: 'created_at', value: dateRange }
          return newFilters
        }
      } else {
        if (createdAtIndex !== -1) {
          return prevFilters.filter((_, i) => i !== createdAtIndex)
        }
        return prevFilters
      }
    })
  }, [dateRange])

  // Get filtered row count
  const filteredRowCount = table.getFilteredRowModel().rows.length
  const totalRowCount = table.getCoreRowModel().rows.length

  // Handle row click
  const handleRowClick = (quote: Quote, event: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't open sheet if clicking on buttons, dropdowns, or interactive elements
    const target = event.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('[role="menuitem"]') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('a')
    ) {
      return
    }
    setSelectedQuote(quote)
    setIsSheetOpen(true)
  }

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get placeholder text based on selected search field
  const getSearchPlaceholder = () => {
    const placeholders: Record<keyof Quote, string> = {
      id: 'Search...',
      requirement_id: 'Search by requirement ID...',
      client_id: 'Search by client ID...',
      quote_number: 'Search by quote number...',
      currency_code: 'Search by currency code...',
      default_margin_pct: 'Search by default margin percent...',
      tax_pct: 'Search by tax percent...',
      subtotal_cost: 'Search by subtotal cost...',
      subtotal_price: 'Search by subtotal price...',
      tax_amount: 'Search by tax amount...',
      total_price: 'Search by total price...',
      status: 'Search by status...',
      valid_till: 'Search by valid till...',
      notes: 'Search...',
      created_by: 'Search...',
      created_at: 'Search...',
      updated_at: 'Search...',
    }
    return placeholders[searchField] || 'Search...'
  }

// Loading state - only show if we don't have data yet
if (quotesLoading && !quotes) {
  return (
    <div className="w-full space-y-4">
      {/* Search Row Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <Skeleton className="h-8 w-[140px] shrink-0" />
          <Skeleton className="h-8 flex-1 min-w-0" />
        </div>
      </div>

      {/* Filters Row Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:gap-x-2 min-w-0">
          <Skeleton className="h-8 w-[250px]" />
          <div className="flex gap-x-2 flex-wrap">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 shrink-0" />
      </div>

      <div className="w-full max-w-full min-w-0 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
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
      {/* Search Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={(value) => setSearchField(value as keyof Quote)}>
            <SelectTrigger className="h-8 w-[140px] shrink-0">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quote_number">Quote Number</SelectItem>
              <SelectItem value="requirement_id">Requirement ID</SelectItem>
              <SelectItem value="client_id">Client ID</SelectItem>
              <SelectItem value="currency_code">Currency Code</SelectItem>
              <SelectItem value="default_margin_pct">Default Margin Percent</SelectItem>
              <SelectItem value="tax_pct">Tax Percent</SelectItem>
              <SelectItem value="subtotal_cost">Subtotal Cost</SelectItem>
              <SelectItem value="subtotal_price">Subtotal Price</SelectItem>
              <SelectItem value="tax_amount">Tax Amount</SelectItem>
              <SelectItem value="total_price">Total Price</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="valid_till">Valid Till</SelectItem>
            </SelectContent>
          </Select>
          <Input
            name='search'
            placeholder={getSearchPlaceholder()}
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className='h-8 flex-1 min-w-0'
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:gap-x-2 min-w-0">
          <DateRangePicker
            initialDateFrom={dateRange?.from}
            initialDateTo={dateRange?.to}
            onUpdate={(values) => {
              setDateRange(values.range)
            }}
            showCompare={false}
          />
          <div className='flex gap-x-2 flex-wrap'>
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={quoteStatusOptions.map((status: { label: string; value: string }) => ({ ...status }))}
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-full min-w-0 rounded-md border border-dashed">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2 text-center mb-6">
            <h3 className="text-lg font-semibold">No Quotes Found</h3>
            <p className="text-muted-foreground max-w-md text-sm">
              No quotes are available to display. Start by adding some quotes to get started.
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
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      {/* Search Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={(value) => setSearchField(value as keyof Quote)}>
            <SelectTrigger className="h-8 w-[140px] shrink-0">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quote_number">Quote Number</SelectItem>
              <SelectItem value="requirement_id">Requirement ID</SelectItem>
              <SelectItem value="client_id">Client ID</SelectItem>
              <SelectItem value="currency_code">Currency Code</SelectItem>
              <SelectItem value="default_margin_pct">Default Margin Percent</SelectItem>
              <SelectItem value="tax_pct">Tax Percent</SelectItem>
              <SelectItem value="subtotal_cost">Subtotal Cost</SelectItem>
              <SelectItem value="subtotal_price">Subtotal Price</SelectItem>
              <SelectItem value="tax_amount">Tax Amount</SelectItem>
              <SelectItem value="total_price">Total Price</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="valid_till">Valid Till</SelectItem>
            </SelectContent>
          </Select>
          <Input
            name='search'
            placeholder={getSearchPlaceholder()}
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className='h-8 flex-1 min-w-0'
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side: Date filter and filters */}
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:gap-x-2 min-w-0">
          <DateRangePicker
            initialDateFrom={dateRange?.from}
            initialDateTo={dateRange?.to}
            onUpdate={(values) => {
              setDateRange(values.range)
            }}
            showCompare={false}
          />
          <div className='flex gap-x-2 flex-wrap'>
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={quoteStatusOptions.map((status: { label: string; value: string }) => ({ ...status }))}
            />
          </div>
          {(table.getState().columnFilters.length > 0 || table.getState().globalFilter) && (
            <Button
              variant='ghost'
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
                setDateRange(undefined)
              }}
              className='h-8 px-2 lg:px-3'
            >
              Reset Filters
              <X className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        
        {/* Right side: View options */}
        <div className="flex items-center gap-2 shrink-0">
          {table.getState().sorting.length > 0 && (
            <Button
              variant='ghost'
              onClick={() => {
                table.resetSorting()
              }}
              className='h-8 px-2 lg:px-3'
            >
              Reset Sorting
              <X className='ms-2 h-4 w-4' />
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className='overflow-hidden rounded-md border h-full'>
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
                  className='group/row cursor-pointer hover:bg-muted/50 transition-colors'
                  onClick={(e) => handleRowClick(row.original, e)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
      <DataTablePagination 
        table={table} 
        className='mt-auto'
        filteredRowCount={filteredRowCount}
        totalRowCount={totalRowCount}
      />

      {/* Client Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl border-l px-4 sm:px-6 lg:px-8 flex flex-col h-full"
        >
          {selectedQuote && (
            <>
              {/* Header */}
              <SheetHeader className="border-b pb-5 mb-6 shrink-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <SheetTitle className="text-2xl sm:text-3xl font-bold mb-1">
                      Quote Report
                    </SheetTitle>
                    <SheetDescription className="text-sm sm:text-base">
                      Comprehensive details and information
                    </SheetDescription>
                    <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Created: {formatDate(selectedQuote.created_at)}</span>
                    </div>
                  </div>

                    {selectedQuote.status && (
                    <Badge
                      variant="outline"
                      className="capitalize text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full"
                    >
                      {selectedQuote.status}
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto space-y-8 pb-6">
                {/* Contact Information Section */}
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Contact Information
                    </h2>
                  </div>

                  <div className="pl-0 sm:pl-1">
                    <div className="grid gap-1 sm:gap-2">
                      <InfoRow icon={User} label="Name:">
                        {selectedQuote.quote_number}
                      </InfoRow>

                      <InfoRow icon={Mail} label="Email:">
                        <a
                          href={`mailto:${selectedQuote.quote_number}`}
                          className="text-primary hover:underline font-medium wrap-break-word"
                        >
                          {selectedQuote.quote_number}
                        </a>
                      </InfoRow>

                      <InfoRow icon={Phone} label="Phone:">
                        {selectedQuote.quote_number ? (
                          <a
                            href={`tel:${selectedQuote.quote_number}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {selectedQuote.quote_number}
                          </a>
                        ) : (
                          <span className="text-base text-muted-foreground italic font-normal">
                            Not provided
                          </span>
                        )}
                      </InfoRow>

                      <InfoRow icon={Building2} label="Client Code:">
                        {selectedQuote.quote_number}
                      </InfoRow>
                    </div>
                  </div>
                </section>

                {/* Company Information Section */}
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold">Company Information</h2>
                  </div>

                  <div className="pl-0 sm:pl-1">
                    <div className="grid gap-1 sm:gap-2">
                      {selectedQuote.quote_number && (
                        <InfoRow icon={Building2} label="Quote Number:">
                          {selectedQuote.quote_number}
                        </InfoRow>
                      )}

                      {selectedQuote.status && (
                        <InfoRow icon={Briefcase} label="Industry:">
                          <Badge
                            variant="outline"
                            className="capitalize text-xs sm:text-sm px-2.5 py-0.5 w-fit"
                          >
                            {selectedQuote.status}
                          </Badge>
                        </InfoRow>
                      )}

                      {selectedQuote.currency_code && (
                        <InfoRow icon={Globe} label="Currency Code:">
                          <a
                            href={selectedQuote.currency_code}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium wrap-break-word"
                          >
                            {selectedQuote.currency_code}
                          </a>
                        </InfoRow>
                      )}
                    </div>
                  </div>
                </section>

                {/* Client Details Section */}
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold">Client Details</h2>
                  </div>

                  <div className="pl-0 sm:pl-1">
                    <div className="grid gap-1 sm:gap-2">
                      {selectedQuote.created_at && (
                        <InfoRow icon={Calendar} label="Created At:">
                          {formatDate(selectedQuote.created_at)}
                        </InfoRow>
                      )}

                      {selectedQuote.updated_at && (
                        <InfoRow icon={Calendar} label="Updated At:">
                          {formatDate(selectedQuote.updated_at)}
                        </InfoRow>
                      )}
                    </div>
                  </div>
                </section>

                {/* Notes Section */}
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold">Notes</h2>
                  </div>

                  <div className="pl-0 sm:pl-1">
                    <div className="rounded-lg border bg-muted/40 px-3 py-3 sm:px-4 sm:py-4">
                      {selectedQuote.notes ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                          {selectedQuote.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No notes available
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Helper row component
type InfoRowProps = {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-2 sm:min-w-[160px]">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-base font-medium text-foreground wrap-break-word">
        {children}
      </div>
    </div>
  )
}
