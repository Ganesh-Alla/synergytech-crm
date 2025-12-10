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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import {
  salesOrderStatusSchema, type SalesOrder } from './schema'
import { useState, useEffect } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { salesOrderStatusOptions } from './sales-columns'
import { useUserStore } from '@/store/userStore'

const formSchema = z
  .object({
    order_number: z.string().optional().or(z.literal('')),
    client_id: z.string().optional().or(z.literal('')),
    requirement_id: z.string().uuid().nullable(),
    synergy_quote_id: z.string().uuid().nullable(),
    status: salesOrderStatusSchema,
    order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    currency_code: z.string().nullable().optional(),
    total_cost: z.number().nullable().optional(),
    total_price: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
    isEdit: z.boolean(),
  })
type SalesOrderForm = z.infer<typeof formSchema>

type SalesOrderActionDialogProps = {
  currentRow?: SalesOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalesOrderActionDialog({
  currentRow,
  open,
  onOpenChange,
}: SalesOrderActionDialogProps) {
  const isEdit = !!currentRow
  const { addSalesOrder, updateSalesOrder } = useSalesStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user: currentUser } = useUserStore()
  const form = useForm<SalesOrderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          client_id: currentRow.client_id,
          requirement_id: currentRow.requirement_id || null,
          synergy_quote_id: currentRow.synergy_quote_id || null,
          order_number: currentRow.order_number,
          status: currentRow.status as SalesOrderForm['status'],
          notes: currentRow.notes || '',
          isEdit,
        }
      : {
          client_id: '',
          requirement_id: null,
          synergy_quote_id: null,
          order_number: '',
          status: 'draft',
          notes: '',
          isEdit,
        },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          client_id: currentRow.client_id,
          requirement_id: currentRow.requirement_id || null,
          synergy_quote_id: currentRow.synergy_quote_id || null,
          order_number: currentRow.order_number,
          status: currentRow.status as SalesOrderForm['status'],
          order_date: currentRow.order_date,
          currency_code: currentRow.currency_code,
          total_cost: currentRow.total_cost,
          total_price: currentRow.total_price,
          notes: currentRow.notes || '',
          isEdit,
        })
      } else {
        form.reset({
          client_id: '',
          requirement_id: null,
          synergy_quote_id: null,
          order_number: '',
          status: 'draft',
          order_date: null,
          currency_code: 'USD',
          total_cost: 0,
          total_price: 0,
          notes: '',
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (values: SalesOrderForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const salesOrderData: SalesOrder = {
        id: currentRow?.id || '', // Will be generated on server if empty
        client_id: currentRow?.client_id || '',
        requirement_id: currentRow?.requirement_id || null,
        synergy_quote_id: currentRow?.synergy_quote_id || null,
        order_number: values.order_number || '', // Will be generated on server if empty
        status: values.status as SalesOrderForm['status'],
        order_date: values.order_date || new Date().toISOString(),
        currency_code: values.currency_code || 'USD',
        total_cost: values.total_cost || 0,
        total_price: values.total_price || 0,
        notes: values.notes || null,
        created_by: currentRow?.created_by || currentUser?.id || '',  
        created_at: now,
        updated_at: now,
      }

      if (isEdit) {
        await updateSalesOrder(salesOrderData)
      } else {
        await addSalesOrder(salesOrderData)
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
              {isEdit && (
                <FormField
                  control={form.control}
                  name='order_number'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Vendor Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='C001'
                          className='col-span-4'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='order_date'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Order Date *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder='2025-01-01'
                        className='col-span-4'
                        autoComplete='off'
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
                name='currency_code'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Currency Code *</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='USD'
                        className='col-span-4'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
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
                    name='total_cost'
                    render={({ field }) => (
                      <FormItem className='max-w-[140px]'>
                        <FormControl>
                          <Input
                            type='number'
                            defaultValue={field.value || 0}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e.target.value)
                            }}
                            placeholder='1000'
                            className='w-full'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='total_price'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                        <Input
                            type="number"
                            placeholder="1234567890"
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e.target.value)
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
                name='notes'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Notes</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Add any notes about this sales order...'
                        className='col-span-4'
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                      />
                    </FormControl>
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
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value || 'draft'}
                        onValueChange={(value) => {
                          field.onChange(value as SalesOrderForm['status'])
                        }}
                        placeholder='Select a status'
                        className='col-span-4'
                        isControlled={true}
                        items={salesOrderStatusOptions.map((status) => ({
                          label: status.label,
                          value: status.value,
                        }))}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='requirement_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Requirement ID *</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='REQ-001'
                        className='col-span-4'
                        {...field}
                        value={field.value as string | undefined}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='synergy_quote_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Synergy Quote ID *</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='QUO-001'
                        className='col-span-4'
                        {...field}
                        value={field.value as string | undefined}
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
                        placeholder='Add any notes about this sales order...'
                        className='col-span-4 min-h-[100px]'
                        {...field}
                        value={field.value as string | undefined}
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
          <Button type='submit' form='sales-order-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
