"use client"
import { UserPlus } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { LeadsTable } from "@/components/executive/leads/leads-table"
import { Button } from "@/components/ui/button"
import { LeadsDialogs } from "@/components/executive/leads/leads-dialog"
import { useLeadsDialog } from "@/store/useLeadsDialog"
import { LeadsStoreInitializer } from "@/providers/InitStore"

const Leads = () => {
  const { setOpenDialog } = useLeadsDialog()
  return (
    <>
      <LeadsStoreInitializer />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Leads List</h2>
            <p className='text-muted-foreground'>
              Manage your leads here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpenDialog('AddLead')}>
              <span>Add Lead</span> <UserPlus size={18} />
            </Button>
          </div>
        </div>
        <LeadsTable />
        <LeadsDialogs />
      </Main>
    </>
  )
}

export default Leads