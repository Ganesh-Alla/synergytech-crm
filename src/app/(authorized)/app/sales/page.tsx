"use client"
import { Pencil, RefreshCw } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { useSalesStore } from "@/store/salesStore"
import { useSalesDialog } from "@/store/dialogs/useSalesDialog"
import { SalesDialogs } from "@/components/executive/sales/sales-dialog"
import { SalesOrderTable } from "@/components/executive/sales/sales-table"

const SalesPage = () => {
  const { setOpenDialog } = useSalesDialog()
  const { loadSalesOrders, salesOrdersLoading } = useSalesStore()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Sales Orders List</h2>
            <p className='text-muted-foreground'>
              Manage your sales orders here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button 
              variant='outline' 
              size='icon' 
              onClick={() => {
                loadSalesOrders(true).catch(console.error)
              }}
            >
              <RefreshCw size={18} className={salesOrdersLoading ? "animate-spin" : ""} />
            </Button>
            <Button className='space-x-1' onClick={() => setOpenDialog('AddSalesOrder')}>
              <span>Add Sales Order</span> <Pencil size={18} />
            </Button>
          </div>
        </div>
        <SalesOrderTable />
        <SalesDialogs />
      </Main>
  )
}

export default SalesPage