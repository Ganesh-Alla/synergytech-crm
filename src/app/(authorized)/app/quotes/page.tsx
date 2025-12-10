"use client"
import { Pencil, RefreshCw } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { useQuotesStore } from "@/store/quotesStore"
import { useQuotesDialog } from "@/store/dialogs/useQuotesDialog"
import { QuotesDialogs } from "@/components/executive/quotes/quotes-dialog"
import { QuotesTable } from "@/components/executive/quotes/quotes-table"

const QuotesPage = () => {
  const { setOpenDialog } = useQuotesDialog()
  const { loadQuotes, quotesLoading } = useQuotesStore()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quotes List</h2>
            <p className='text-muted-foreground'>
              Manage your quotes here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button 
              variant='outline' 
              size='icon' 
              onClick={() => {
                loadQuotes(true).catch(console.error)
              }}
            >
              <RefreshCw size={18} className={quotesLoading ? "animate-spin" : ""} />
            </Button>
            <Button className='space-x-1' onClick={() => setOpenDialog('AddQuote')}>
              <span>Add Quote</span> <Pencil size={18} />
            </Button>
          </div>
        </div>
        <QuotesTable />
        <QuotesDialogs />
      </Main>
  )
}

export default QuotesPage