"use client"
import { RefreshCw, UserPlus } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { useRequirementsDialog } from "@/store/dialogs/useRequirementsDialog"
import { useRequirementsStore } from "@/store/requirementsStore"
import Link from "next/link"
import { RequirementsTable } from "@/components/executive/requirements/requirements-table"

const RequirementsPage = () => {
  const { setOpenDialog } = useRequirementsDialog()
  const { loadRequirements, requirementsLoading } = useRequirementsStore()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Requirements List</h2>
            <p className='text-muted-foreground'>
              Manage your requirements here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button 
              variant='outline' 
              size='icon' 
              onClick={() => {
                loadRequirements(true).catch(console.error)
              }}
            >
              <RefreshCw size={18} className={requirementsLoading ? "animate-spin" : ""} />
            </Button>
            <Button asChild>
            <Link className='space-x-1' href="/app/requirements/new">
              <span>Add Requirement</span> <UserPlus size={18} />
            </Link>
            </Button>
          </div>
        </div>
        <RequirementsTable />
        {/* <RequirementsDialogs /> */}
      </Main>
  )
}

export default RequirementsPage