'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { Checkbox } from '@/components/ui/checkbox'
import { roles } from './user-columns'
import type{  User } from '@/components/admin/users/schema'
import { useAuthUserStore } from '@/store/authUserStore'
import { useUserStore } from '@/store/userStore'
import { useState } from 'react'
import { Label } from '@/components/ui/label'



const formSchema = z
  .object({
    full_name: z.string().min(1, 'Full Name is required.'),
    email: z.email({
      error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    permission: z.string().min(1, 'Permission is required.'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
    agreeToLogout: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'Password must be at least 8 characters long.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: 'Password must contain at least one lowercase letter.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: 'Password must contain at least one number.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const { addAuthUser, updateAuthUser } = useAuthUserStore()
  const { user: currentUser, signOutAsync } = useUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreeToLogout, setAgreeToLogout] = useState(false)
  
  // Check if the user is updating their own record
  const isUpdatingSelf = isEdit && currentUser && currentRow?.id === currentUser.id
  // Check if current user is admin (not super_admin)
  const isAdmin = currentUser?.permission === 'admin'
  // Check if current user is super_admin
  const isSuperAdmin = currentUser?.permission === 'super_admin'
  // Check if editing a super_admin user
  const isEditingSuperAdmin = isEdit && currentRow?.permission === 'super_admin'
  
  // Determine if permission field should be disabled:
  // - super_admin: disabled only when editing their own record
  // - admin: disabled when editing their own record OR when editing a super_admin
  const isPermissionDisabled = 
    (isSuperAdmin && isUpdatingSelf) || 
    (isAdmin && (isUpdatingSelf || isEditingSuperAdmin))
  
  // Filter roles based on current user permission:
  // - admin: cannot see/edit super_admin role
  // - super_admin: can see all roles
  const availableRoles = isAdmin 
    ? roles.filter(({ value }) => value !== 'super_admin')
    : roles
  
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          full_name: '',
          email: '',
          permission: '',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    setIsSubmitting(true)
    try {
      const userData: User = {
        id: currentRow?.id || '',
        full_name: values.full_name,
        email: values.email,
        permission: values.permission as User['permission'],
        status: currentRow?.status || 'active',
      }

      if (isEdit) {
        const passwordChanged = !!values.password && values.password.length > 0

        await updateAuthUser(userData, values.password || undefined)
        
        form.reset()
        onOpenChange(false)
        
        // If user updated their own record
        if (isUpdatingSelf) {
          if (passwordChanged) {
            // Auto logout if password changed
            await signOutAsync('local')
          } 
            // Reload page if other fields changed
            window.location.reload()
          
        }
      } else {
        await addAuthUser(userData, values.password)
        form.reset()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      // Error is already handled by the store with toast notifications
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  const handleAgreeToLogoutChange = (checked: boolean | 'indeterminate') => {
    setAgreeToLogout(checked === true)
  }

  return (
      <Dialog
        open={open}
        onOpenChange={(state) => {
          if (!state) {
            form.reset()
          }
          onOpenChange(state)
        }}
      >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-75 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='full_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                disabled={isEdit}
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='permission'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a role'
                      className='col-span-4'
                      disabled={isPermissionDisabled}
                      items={availableRoles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {isUpdatingSelf && (
                  <div className="flex items-start gap-3">
                  <Checkbox id="terms-2" checked={agreeToLogout} onCheckedChange={handleAgreeToLogoutChange} />
                  <div className="grid gap-2">
                    <Label htmlFor="terms-2">I agree to logout.</Label>
                    <p className="text-muted-foreground text-sm">
                      By clicking this checkbox, you agree to logout and re-login to apply changes to your account.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={Boolean(isSubmitting || (isUpdatingSelf && !agreeToLogout))}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
