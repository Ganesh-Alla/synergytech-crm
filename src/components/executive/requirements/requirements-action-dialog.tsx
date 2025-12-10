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
import { Requirement, requirementStatusSchema, requirementPrioritySchema } from './schema'
import { useRequirementsStore } from '@/store/requirementsStore'
import { useUserStore } from '@/store/userStore'
import { useState, useEffect } from 'react'
import { requirementPriority, requirementStatus } from './requirements-columns'
import { useAuthUserStore } from '@/store/authUserStore'
import { useClientsStore } from '@/store/clientsStore'
import { Textarea } from '@/components/ui/textarea'
import { currencyOptions } from '@/lib/currency'

const formSchema = z
  .object({
    client_id: z.string().uuid(),
    currency_code: z.string().nullable().optional(),
    title: z.string(),
    description: z.string().nullable(),
    status: requirementStatusSchema,
    priority: requirementPrioritySchema.nullable(),
    required_by_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    estimated_budget_number: z.number().nullable(),
    estimated_budget: z.string().nullable(),
    assigned_to: z.string().uuid().nullable(),
    isEdit: z.boolean(),
  })
type RequirementForm = z.infer<typeof formSchema>

type RequirementActionDialogProps = {
  currentRow?: Requirement
  currentClientId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequirementsActionDialog({
  currentRow,
  currentClientId,
  open,
  onOpenChange,
}: RequirementActionDialogProps) {
  const isEdit = !!currentRow
  const { addRequirement, updateRequirement } = useRequirementsStore()
  const { user: currentUser } = useUserStore()
  const { clients, loadClients } = useClientsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { authUsers, loadAuthUsers } = useAuthUserStore()

  console.log('currentClientId', currentClientId)
  // Load clients and users when dialog opens
  useEffect(() => {
    if (open) {
      loadClients()
      loadAuthUsers()
    }
  }, [open, loadClients, loadAuthUsers])

  const form = useForm<RequirementForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
        client_id: currentRow.client_id,
        currency_code: currentRow.currency_code,
        title: currentRow.title,
        description: currentRow.description,
        status: currentRow.status,
        priority: currentRow.priority,
        required_by_date: currentRow.required_by_date,
        estimated_budget_number: currentRow.estimated_budget_number,
        estimated_budget: currentRow.estimated_budget,
        assigned_to: currentRow.assigned_to,
        isEdit,
      }
      : {
       
        client_id: '',
        currency_code: 'USD',
        title: '',
        description: '',
        status: 'new',
        priority: null,
        required_by_date: null,
        estimated_budget_number: null,
        estimated_budget: '',
        assigned_to: null,
        isEdit,
      },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          client_id: currentRow.client_id,
          currency_code: currentRow.currency_code,
          title: currentRow.title,
          description: currentRow.description,
          status: currentRow.status,
          priority: currentRow.priority,
          required_by_date: currentRow.required_by_date,
          estimated_budget_number: currentRow.estimated_budget_number,
          estimated_budget: currentRow.estimated_budget,
          assigned_to: currentRow.assigned_to,
          isEdit,
        })
      } else {
        form.reset({
          client_id: currentClientId || '',
          currency_code: 'USD',
          title: '',
          description: '',
          status: 'new',
          priority: null,
          required_by_date: null,
          estimated_budget_number: null,
          estimated_budget: '',
          assigned_to: null,
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const assignableUsers = authUsers?.filter(
    (user) => user.permission !== 'admin' && user.permission !== 'super_admin'
  ) || []

  const onSubmit = async (values: RequirementForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {
      
      // Concatenate currency code with budget
      let fullEstimatedBudget: string | null = null
      if (values.estimated_budget_number) {
        const currency = currencyOptions.find(c => c.isoCode === values.currency_code)
        const currencySymbol = currency?.symbol || '$'
        fullEstimatedBudget = `${currencySymbol}${values.estimated_budget_number}`
      }

      const now = new Date().toISOString()
      const requirementData: Requirement = {
        id: currentRow?.id || '', // Will be generated on server if empty
        client_id: values.client_id,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        required_by_date: values.required_by_date,
        estimated_budget: fullEstimatedBudget,
        assigned_to: values.assigned_to,
        created_by: currentRow?.created_by || currentUser?.id || '',
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      console.log('requirementData', requirementData)


      if (isEdit) {
        await updateRequirement(requirementData)
      } else {
        await addRequirement(requirementData)
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
          <DialogTitle>{isEdit ? 'Edit Requirement' : 'Add New Requirement'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the requirement here. ' : 'Create new requirement here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-75 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='requirement-form'
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
                name='client_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Client Code
                    </FormLabel>
                    <FormControl>
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
                        disabled={!!currentClientId}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Title *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Requirement Title'
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
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Requirement Description'
                        className='col-span-4'
                        {...field}
                        value={field.value || ''}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <div className="flex flex-row gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 flex-1">
                      <FormLabel className="min-w-[70px] text-end">Status</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value || "new"}
                          onValueChange={value => {
                            field.onChange(value);
                          }}
                          placeholder="Select Status"
                          className="w-full"
                          isControlled={true}
                          items={requirementStatus.map(status => ({
                            label: status.label,
                            value: status.value,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 flex-1">
                      <FormLabel className="min-w-[70px] text-end">Priority</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value || "low"}
                          onValueChange={value => {
                            field.onChange(value);
                          }}
                          placeholder="Select Priority"
                          className="w-full"
                          isControlled={true}
                          items={requirementPriority.map(priority => ({
                            label: priority.label,
                            value: priority.value,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='required_by_date'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Required By Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder='Required By Date'
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
              <div className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                <FormLabel className='col-span-2 text-end'>Estimated Budget</FormLabel>
                <div className='col-span-4 flex gap-2'>
                  <FormField
                    control={form.control}
                    name='currency_code'
                    render={({ field }) => (
                      <FormItem className='max-w-[140px]'>
                        <FormControl>
                          <SelectDropdown
                            defaultValue={field.value || 'USD'}
                            onValueChange={(value) => {
                              field.onChange(value)
                            }}
                            placeholder='Currency'
                            className='w-full'
                            isControlled={true}
                            items={currencyOptions.map((currency) => ({
                              label: currency.symbol,
                              value: currency.isoCode,
                            }))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='estimated_budget_number'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="flex-1"
                            {...field}
                            value={field.value ?? ""} // allow empty
                            onChange={(e) => {
                              const value = e.target.value;

                              // Allow empty string so user can clear input
                              if (value === "") {
                                field.onChange(null);
                                return;
                              }

                              field.onChange(parseFloat(value)); // Convert string → number
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
                name='assigned_to'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Assigned To</FormLabel>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='requirement-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
