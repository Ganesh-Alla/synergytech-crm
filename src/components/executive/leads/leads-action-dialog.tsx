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
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { Textarea } from '@/components/ui/textarea'
import { statusOptions, sourceOptions } from './leads-columns'
import { useLeadsStore } from '@/store/leadsStore'
import type { Lead } from './schema'
import { useUserStore } from '@/store/userStore'
import { useClientsStore } from '@/store/clientsStore'
import { useAuthUserStore } from '@/store/authUserStore'
import { useState, useEffect } from 'react'

const formSchema = z
  .object({
    contact_name: z.string().min(1, 'Contact Name is required.'),
    contact_email: z.string().email('Invalid email address.'),
    contact_phone: z.string().nullable().optional(),
    client_code: z
      .union([
        z.string(),
        z.literal('').transform(() => null),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    source: z.enum(['website', 'referral', 'email', 'phone', 'event', 'whatsapp']),
    status: z.enum(['new', 'in_progress', 'won', 'lost']),
    assigned_to: z
      .union([
        z.uuid(),
        z.literal('').transform(() => null),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    follow_up_at: z
      .union([
        z.iso.datetime(),
        z.literal('').transform(() => null),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    notes: z.string().nullable().optional(),
    isEdit: z.boolean(),
  })
type LeadForm = z.infer<typeof formSchema>

type LeadActionDialogProps = {
  currentRow?: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: LeadActionDialogProps) {
  const isEdit = !!currentRow
  const { addLead, updateLead } = useLeadsStore()
  const { user: currentUser } = useUserStore()
  const { clients, loadClients } = useClientsStore()
  const { authUsers, loadAuthUsers } = useAuthUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load clients and users when dialog opens
  useEffect(() => {
    if (open) {
      loadClients()
      loadAuthUsers()
    }
  }, [open, loadClients, loadAuthUsers])

  // Filter users to exclude admin and super_admin
  const assignableUsers = authUsers?.filter(
    (user) => user.permission !== 'admin' && user.permission !== 'super_admin'
  ) || []
  
  const form = useForm<LeadForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          contact_name: currentRow.contact_name,
          contact_email: currentRow.contact_email,
          contact_phone: currentRow.contact_phone || '',
          client_code: currentRow.client_code || undefined,
          source: currentRow.source as LeadForm['source'],
          status: currentRow.status as LeadForm['status'],
          assigned_to: currentRow.assigned_to || undefined,
          follow_up_at: currentRow.follow_up_at || '',
          notes: currentRow.notes || '',
          isEdit,
        }
      : {
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          client_code: undefined,
          source: 'website',
          status: 'new',
          assigned_to: undefined,
          follow_up_at: '',
          notes: '',
          isEdit,
        },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          contact_name: currentRow.contact_name,
          contact_email: currentRow.contact_email,
          contact_phone: currentRow.contact_phone || '',
          client_code: currentRow.client_code || undefined,
          source: currentRow.source as LeadForm['source'],
          status: currentRow.status as LeadForm['status'],
          assigned_to: currentRow.assigned_to || undefined,
          follow_up_at: currentRow.follow_up_at || '',
          notes: currentRow.notes || '',
          isEdit,
        })
      } else {
        form.reset({
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          client_code: undefined,
          source: 'website',
          status: 'new',
          assigned_to: undefined,
          follow_up_at: '',
          notes: '',
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (values: LeadForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const leadData: Lead = {
        id: currentRow?.id || '', // Will be generated on server if empty
        client_code: values.client_code || null,
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || null,
        source: values.source,
        status: values.status,
        assigned_to: values.assigned_to || null,
        follow_up_at: values.follow_up_at || null,
        notes: values.notes || null,
        created_by: currentRow?.created_by || currentUser?.id || '',
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      if (isEdit) {
        await updateLead(leadData)
      } else {
        await addLead(leadData)
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
      // Error is already handled by the store with toast notifications
    } finally {
      setIsSubmitting(false)
    }
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
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the lead here. ' : 'Create new lead here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-75 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='lead-form'
              onSubmit={(e) => {
                e.preventDefault()
                console.log('Form submit event triggered')
                console.log('Form values:', form.getValues())
                console.log('Form errors:', form.formState.errors)
                console.log('Form isValid:', form.formState.isValid)
                form.handleSubmit(
                  onSubmit,
                  (errors) => {
                    console.log('Form validation failed:', errors)
                  }
                )(e)
              }}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='contact_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Contact Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
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
                name='contact_email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john.doe@example.com'
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
                name='contact_phone'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+1234567890'
                        className='col-span-4'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='client_code'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Client Code</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value === null ? '__none__' : (field.value || undefined)}
                      onValueChange={(value) => {
                        field.onChange(value === '__none__' ? null : value)
                      }}
                      placeholder='Select a client'
                      className='col-span-4'
                      isControlled={true}
                      items={[
                        { label: 'None', value: '__none__' },
                        ...(clients?.map((client) => ({
                          label: client.client_code,
                          value: client.client_code,
                        })) || []),
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='assigned_to'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Assigned To</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value === null ? '__none__' : (field.value || undefined)}
                      onValueChange={(value) => {
                        field.onChange(value === '__none__' ? null : value)
                      }}
                      placeholder='Select a user'
                      className='col-span-4'
                      isControlled={true}
                      items={[
                        { label: 'None', value: '__none__' },
                        ...assignableUsers.map((user) => ({
                          label: user.full_name,
                          value: user.id,
                        })),
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='source'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Source *</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value || 'website'}
                      onValueChange={(value) => {
                        console.log('Source changed to:', value)
                        field.onChange(value)
                      }}
                      placeholder='Select a source'
                      className='col-span-4'
                      isControlled={true}
                      items={sourceOptions.map(({ label, value }) => ({
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
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Status *</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value || 'new'}
                      onValueChange={(value) => {
                        console.log('Status changed to:', value)
                        field.onChange(value)
                      }}
                      placeholder='Select a status'
                      className='col-span-4'
                      isControlled={true}
                      items={statusOptions.map(({ label, value }) => ({
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
                name='follow_up_at'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Follow Up At</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        className='col-span-4'
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? new Date(value).toISOString() : null)
                        }}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add any notes about this lead...'
                        className='col-span-4 min-h-[100px]'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='lead-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
