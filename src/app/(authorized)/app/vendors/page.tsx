"use client"
import { RefreshCw, UserPlus } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { useVendorsStore } from "@/store/vendorsStore"
import { useVendorsDialog } from "@/store/dialogs/useVendorsDialog"
import { VendorsTable } from "@/components/executive/vendors/vendors-table"
import { VendorsDialogs } from "@/components/executive/vendors/vendors-dialog"

const VendorsPage = () => {
  const { setOpenDialog } = useVendorsDialog()
  const { loadVendors, vendorsLoading } = useVendorsStore()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Vendors List</h2>
            <p className='text-muted-foreground'>
              Manage your vendors here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button 
              variant='outline' 
              size='icon' 
              onClick={() => {
                loadVendors(true).catch(console.error)
              }}
            >
              <RefreshCw size={18} className={vendorsLoading ? "animate-spin" : ""} />
            </Button>
            <Button className='space-x-1' onClick={() => setOpenDialog('AddVendor')}>
              <span>Add Vendor</span> <UserPlus size={18} />
            </Button>
          </div>
        </div>
        <VendorsTable />
        <VendorsDialogs />
      </Main>
  )
}

export default VendorsPage