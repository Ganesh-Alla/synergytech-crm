"use client"
import { Pencil, RefreshCw } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { ExpensesDialogs } from "@/components/executive/expenses/expenses-dialog"
import { ExpensesTable } from "@/components/executive/expenses/expenses-table"
import { useExpensesStore } from "@/store/expensesStore"
import { useExpensesDialog } from "@/store/dialogs/useExpensesDialog"

const ExpensesPage = () => {
  const { setOpenDialog } = useExpensesDialog()
  const { loadExpenses, expensesLoading } = useExpensesStore()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Expenses List</h2>
            <p className='text-muted-foreground'>
              Manage your expenses here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button 
              variant='outline' 
              size='icon' 
              onClick={() => {
                loadExpenses(true).catch(console.error)
              }}
            >
              <RefreshCw size={18} className={expensesLoading ? "animate-spin" : ""} />
            </Button>
            <Button className='space-x-1' onClick={() => setOpenDialog('AddExpense')}>
              <span>Add Expense</span> <Pencil size={18} />
            </Button>
          </div>
        </div>
        <ExpensesTable />
        <ExpensesDialogs />
      </Main>
  )
}

export default ExpensesPage