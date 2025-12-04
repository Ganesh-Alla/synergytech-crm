"use client"
import { UserPlus } from "lucide-react"
import { Main } from "@/components/admin/layout/main"
import { UsersTable } from "@/components/admin/users/users-table"
import { Button } from "@/components/ui/button"

const Users = () => {
  
  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
    <div className='flex flex-wrap items-end justify-between gap-2'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
        <p className='text-muted-foreground'>
          Manage your users and their roles here.
        </p>
      </div>
      <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => {}}>
        <span>Add User</span> <UserPlus size={18} />
      </Button>
    </div>
    </div>
    <UsersTable />
  </Main>
  )
}

export default Users