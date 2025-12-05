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
import { sourceOptions } from './clients-columns'
import type { Client } from './schema'
import { useClientsStore } from '@/store/clientsStore'
import { useUserStore } from '@/store/userStore'
import { useState } from 'react'

const formSchema = z
  .object({
    client_code: z.string().min(1, 'Client Code is required.').optional(),
    company_name: z.string().nullable().optional(),
    contact_name: z.string().min(1, 'Contact Name is required.'),
    contact_email: z.string().email('Invalid email address.'),
    contact_phone: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    website: z.string().url('Invalid URL.').nullable().optional().or(z.literal('')),
    source: z.enum(['website', 'referral', 'email', 'phone', 'event', 'whatsapp']),
    account_owner: z.string().uuid().nullable().optional(),
    next_follow_up_at: z.string().datetime().nullable().optional(),
    last_interaction_at: z.string().datetime().nullable().optional(),
    notes: z.string().nullable().optional(),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.website && data.website !== '') {
        try {
          new URL(data.website)
          return true
        } catch {
          return false
        }
      }
      return true
    },
    {
      message: 'Invalid URL format.',
      path: ['website'],
    }
  )
type ClientForm = z.infer<typeof formSchema>

type ClientActionDialogProps = {
  currentRow?: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ClientActionDialogProps) {
  const isEdit = !!currentRow
  const { addClient, updateClient } = useClientsStore()
  const { user: currentUser } = useUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ClientForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          client_code: currentRow.client_code,
          company_name: currentRow.company_name || '',
          contact_name: currentRow.contact_name,
          contact_email: currentRow.contact_email,
          contact_phone: currentRow.contact_phone || '',
          industry: currentRow.industry || '',
          website: currentRow.website || '',
          source: currentRow.source,
          account_owner: currentRow.account_owner || '',
          next_follow_up_at: currentRow.next_follow_up_at || '',
          last_interaction_at: currentRow.last_interaction_at || '',
          notes: currentRow.notes || '',
          isEdit,
        }
      : {
          client_code: '',
          company_name: '',
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          industry: '',
          website: '',
          source: 'website',
          account_owner: '',
          next_follow_up_at: '',
          last_interaction_at: '',
          notes: '',
          isEdit,
        },
  })

  const onSubmit = async (values: ClientForm) => {
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const clientData: Client = {
        id: currentRow?.id || '', // Will be generated on server if empty
        client_code: values.client_code || '', // Will be generated on server if empty
        company_name: values.company_name || null,
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || null,
        industry: values.industry || null,
        website: values.website || null,
        source: values.source,
        account_owner: values.account_owner || null,
        next_follow_up_at: values.next_follow_up_at || null,
        last_interaction_at: values.last_interaction_at || null,
        notes: values.notes || null,
        created_by: currentRow?.created_by || currentUser?.id || '',
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      if (isEdit) {
        await updateClient(clientData)
      } else {
        await addClient(clientData)
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
          <DialogTitle>{isEdit ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the client here. ' : 'Create new client here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-75 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='client-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              {isEdit && (
                <FormField
                  control={form.control}
                  name='client_code'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Client Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='C001'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
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
                name='company_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Acme Inc.'
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
                name='industry'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Technology'
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
                name='website'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Website</FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://example.com'
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
                name='source'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Source *</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a source'
                      className='col-span-4'
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
                name='next_follow_up_at'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Next Follow Up</FormLabel>
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
                        placeholder='Add any notes about this client...'
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
          <Button type='submit' form='client-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
