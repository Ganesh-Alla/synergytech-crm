"use client"
import { ArrowLeft } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import NewRequirementForm from "@/components/executive/requirements/new-requirement-form"

const RequirementsNewPage = () => {

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
            <Link className='space-x-1' href="/app/requirements">
              <span>Back to Requirements</span> <ArrowLeft size={18} />
            </Link>
            </Button>
          </div>
        </div>
        <NewRequirementForm />
      </Main>
  )
}

export default RequirementsNewPage