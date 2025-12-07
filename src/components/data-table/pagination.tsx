import type { Table } from '@tanstack/react-table'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
  } from 'lucide-react'
  import { Button } from '@/components/ui/button'
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select'
  import { cn, getPageNumbers } from '@/lib/utils'
  
  type DataTablePaginationProps<TData> = {
    table: Table<TData>
    className?: string
    filteredRowCount?: number
    totalRowCount?: number
  }
  
  export function DataTablePagination<TData>({
    table,
    className,
    filteredRowCount,
    totalRowCount,
  }: DataTablePaginationProps<TData>) {
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()
    const pageNumbers = getPageNumbers(currentPage, totalPages)

    return (
      <div
        className={cn(
          'flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between',
          className
        )}
      >
        {/* Rows per page section - Mobile optimized */}
        <div className='flex w-full items-center justify-between sm:w-auto sm:justify-start'>
          <div className='flex items-center gap-2'>
            <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className='h-8 w-[70px] sm:w-[70px]'>
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Row count and mobile page info */}
          <div className='flex items-center gap-2 text-sm sm:hidden'>
            {filteredRowCount !== undefined && totalRowCount !== undefined && (
              <span className='text-muted-foreground'>
                {filteredRowCount === totalRowCount ? (
                  <>{totalRowCount} {totalRowCount === 1 ? 'item' : 'items'}</>
                ) : (
                  <>{filteredRowCount} of {totalRowCount} {totalRowCount === 1 ? 'item' : 'items'}</>
                )}
              </span>
            )}
            <span className='font-medium'>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {/* Pagination controls */}
        <div className='flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-2'>
          {/* Desktop row count and page info */}
          <div className='hidden items-center gap-2 text-sm sm:flex'>
            {filteredRowCount !== undefined && totalRowCount !== undefined && (
              <span className='text-muted-foreground'>
                {filteredRowCount === totalRowCount ? (
                  <>{totalRowCount} {totalRowCount === 1 ? 'item' : 'items'}</>
                ) : (
                  <>{filteredRowCount} of {totalRowCount} {totalRowCount === 1 ? 'item' : 'items'}</>
                )}
              </span>
            )}
            <span className='font-medium'>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          {/* Navigation buttons */}
          <div className='flex items-center gap-1 sm:gap-2'>
            <Button
              variant='outline'
              className='size-8 p-0 hidden sm:flex'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to first page</span>
              <ChevronsLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>

            {/* Page number buttons - Hidden on mobile, shown on tablet+ */}
            <div className='hidden items-center gap-1 md:flex'>
              {pageNumbers.map((pageNumber, index) => (
                <div key={`${pageNumber}-${index}-${Date.now()}`} className='flex items-center'>
                  {pageNumber === '...' ? (
                    <span className='text-muted-foreground px-1 text-sm'>...</span>
                  ) : (
                    <Button
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      className='h-8 min-w-8 px-2'
                      onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                    >
                      <span className='sr-only'>Go to page {pageNumber}</span>
                      {pageNumber}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant='outline'
              className='size-8 p-0'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='size-8 p-0 hidden sm:flex'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to last page</span>
              <ChevronsRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    )
  }