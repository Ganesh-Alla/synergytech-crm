"use client"
import { ArrowLeft, RefreshCw, UserPlus } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { useRequirementsDialog } from "@/store/dialogs/useRequirementsDialog"
// import { RequirementsTable } from "@/components/executive/requirements/requirements-table"
// import { RequirementsDialogs } from "@/components/executive/requirements/requirements-dialog"
import { useRequirementsStore } from "@/store/requirementsStore"
import Link from "next/link"
import NewRequirementForm from "@/components/executive/requirements/new-requirement-form"

const RequirementsNewPage = () => {
  const { setOpenDialog } = useRequirementsDialog()
  const { loadRequirements, requirementsLoading } = useRequirementsStore()
  return (
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>New Requirement</h2>
            <p className='text-muted-foreground'>
              Create a new requirement here.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button asChild>
            <Link className='space-x-1' href="/requirements">
              <span>Back to Requirements</span> <ArrowLeft size={18} />
            </Link>
            </Button>
          </div>
        </div>
        <NewRequirementForm />
        {/* <RequirementsDialogs /> */}
      </Main>
  )
}

export default RequirementsNewPage