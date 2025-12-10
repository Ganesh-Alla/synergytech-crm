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
import { countryOptions, countryCodeToFlag, extractCountryCode } from '@/lib/phoneFlags'

const formSchema = z
  .object({
    contact_name: z.string().min(1, 'Contact Name is required.'),
    contact_email: z.string().email('Invalid email address.'),
    country_code: z.string().optional(),
    contact_phone: z.string().nullable().optional(),
    contact_number: z.string().nullable().optional(),
    client_id: z
      .union([
        z.uuid(),
        z.literal('').transform(() => null),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    client_code: z
      .union([
        z.string(),
        z.literal('').transform(() => null),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    source: z.enum(['website', 'referral', 'email', 'phone', 'event', 'whatsapp']),
    status: z.enum(['new', 'in_progress', 'incompatible', 'not_serviced', 'converted']),
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
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
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

// Helper function to format date for date input (YYYY-MM-DD)
const formatDateForInput = (dateValue: string | null | undefined): string => {
  if (!dateValue) return ''
  // If already in YYYY-MM-DD format, return as is
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue
  }
  // Try to parse and format
  try {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

// Helper function to extract country code and phone number from full phone string
const parsePhoneNumber = (phone: string | null | undefined): { countryCode: string; phoneNumber: string } => {
  if (!phone) return { countryCode: '91', phoneNumber: '' }

  const extractedCode = extractCountryCode(phone)
  if (extractedCode) {
    // Find the ISO code for this dial code
    const country = countryOptions.find(c => c.dialCode === extractedCode)
    const phoneWithoutCode = phone.replace(new RegExp(`^\\+?${extractedCode}`), '').trim()
    return {
      countryCode: country?.isoCode || '91',
      phoneNumber: phoneWithoutCode
    }
  }

  return { countryCode: '91', phoneNumber: phone }
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

  const parsedPhone = isEdit && currentRow ? parsePhoneNumber(currentRow.contact_phone) : { countryCode: '91', phoneNumber: '' }

  const form = useForm<LeadForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
        contact_name: currentRow.contact_name,
        contact_email: currentRow.contact_email,
        country_code: parsedPhone.countryCode,
        contact_number: parsedPhone.phoneNumber || undefined,
        client_id: currentRow.client_id || undefined,
        source: currentRow.source as LeadForm['source'],
        status: currentRow.status as LeadForm['status'],
        assigned_to: currentRow.assigned_to || undefined,
        follow_up_at: formatDateForInput(currentRow.follow_up_at),
        notes: currentRow.notes || '',
        isEdit,
      }
      : {
        contact_name: '',
        contact_email: '',
        country_code: '91',
        contact_phone: '',
        contact_number: '',
        client_id: undefined,
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
        const parsed = parsePhoneNumber(currentRow.contact_phone)
        form.reset({
          contact_name: currentRow.contact_name,
          contact_email: currentRow.contact_email,
          country_code: parsed.countryCode,
          contact_phone: parsed.phoneNumber,
          contact_number: parsedPhone.phoneNumber || undefined,
          client_id: currentRow.client_id || undefined,
          source: currentRow.source as LeadForm['source'],
          status: currentRow.status as LeadForm['status'],
          assigned_to: currentRow.assigned_to || undefined,
          follow_up_at: formatDateForInput(currentRow.follow_up_at),
          notes: currentRow.notes || '',
          isEdit,
        })
      } else {
        form.reset({
          contact_name: '',
          contact_email: '',
          country_code: '91',
          contact_phone: '',
          contact_number: '',
          client_id: undefined,
          source: 'website',
          status: 'new',
          assigned_to: undefined,
          follow_up_at: '',
          notes: '',
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form, parsedPhone.phoneNumber])

  const onSubmit = async (values: LeadForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {
      // Concatenate country code with phone number
      let fullPhoneNumber: string | null = null
      if (values.contact_number) {
        const country = countryOptions.find(c => c.isoCode === values.country_code)
        const dialCode = country?.dialCode || '91'
        fullPhoneNumber = `+${dialCode}${values.contact_number.replace(/\D/g, '')}`
      }

      const now = new Date().toISOString()
      const leadData: Lead = {
        id: currentRow?.id || '', // Will be generated on server if empty
        client_id: values.client_id || null,
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        contact_phone: fullPhoneNumber,
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
              <div className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                <FormLabel className='col-span-2 text-end'>Phone</FormLabel>
                <div className='col-span-4 flex gap-2'>
                  <FormField
                    control={form.control}
                    name='country_code'
                    render={({ field }) => (
                      <FormItem className='max-w-[140px]'>
                        <FormControl>
                          <SelectDropdown
                            defaultValue={field.value || '91'}
                            onValueChange={(value) => {
                              field.onChange(value)
                            }}
                            placeholder='Country'
                            className='w-full'
                            isControlled={true}
                            items={countryOptions.map((country) => ({
                              label: `${countryCodeToFlag(country.isoCode)} +${country.dialCode}`,
                              value: country.isoCode,
                            }))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='contact_number'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="1234567890"
                            maxLength={10}
                            inputMode="numeric"
                            {...field}
                            value={field.value || ""}
                            onKeyDown={(e) => {
                              // Block non-numeric keys except Backspace, Arrow keys, Tab
                              if (
                                !/[0-9]/.test(e.key) &&
                                !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                              ) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              field.onChange(e.target.value); // Already blocked invalid keys
                            }}
                          />

                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name='client_id'
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
                          value: client.id,
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
                        type='date'
                        className='col-span-4'
                        {...field}
                        value={field.value ? (typeof field.value === 'string' ? field.value : new Date(field.value).toISOString().split('T')[0]) : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value || null)
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
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='lead-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
