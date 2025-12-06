"use client"
import { UserPlus } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { useClientsDialog } from "@/store/useClientsDialog"
import { ClientsTable } from "@/components/executive/clients/clients-table"
import { ClientsDialogs } from "@/components/executive/clients/clients-dialog"

const Clients = () => {
  const { setOpenDialog } = useClientsDialog()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Clients List</h2>
            <p className='text-muted-foreground'>
              Manage your clients here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button className='space-x-1' onClick={() => setOpenDialog('AddClient')}>
              <span>Add Client</span> <UserPlus size={18} />
            </Button>
          </div>
        </div>
        <ClientsTable />
        <ClientsDialogs />
      </Main>
  )
}

export default Clients