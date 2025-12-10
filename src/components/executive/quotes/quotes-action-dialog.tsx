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
import {
  QuoteStatusSchema, type Quote } from './schema'
import { useState, useEffect } from 'react'
import { useQuotesStore } from '@/store/quotesStore'
import { quoteStatusOptions } from './quotes-columns'
import { currencyOptions } from '@/lib/currency'

const formSchema = z
  .object({
    quote_number: z.string().optional().or(z.literal('')),
    currency_code: z.string().nullable().optional(),
    default_margin_pct: z.number().nullable().optional(),
    tax_pct: z.number().nullable().optional(),
    subtotal_cost: z.number().nullable().optional(),
    subtotal_price: z.number().nullable().optional(),
    tax_amount: z.number().nullable().optional(),
    total_price: z.number().nullable().optional(),
    status: QuoteStatusSchema,
    valid_till: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    notes: z.string().nullable().optional(),
    isEdit: z.boolean(),
  })
type QuoteForm = z.infer<typeof formSchema>

type QuoteActionDialogProps = {
  currentRow?: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
}


export function QuotesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: QuoteActionDialogProps) {
  const isEdit = !!currentRow
  const { addQuote, updateQuote } = useQuotesStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<QuoteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          quote_number: currentRow.quote_number,
          currency_code: currentRow.currency_code,
          default_margin_pct: currentRow.default_margin_pct,
          tax_pct: currentRow.tax_pct,
          subtotal_cost: currentRow.subtotal_cost,
          subtotal_price: currentRow.subtotal_price,
          tax_amount: currentRow.tax_amount,
          total_price: currentRow.total_price,
          status: currentRow.status as QuoteForm['status'],
          valid_till: currentRow.valid_till || '',
          notes: currentRow.notes || '',
          isEdit,
        }
      : {
          quote_number: '',
          currency_code: 'USD',
          default_margin_pct: 0,
          tax_pct: null,
          subtotal_cost: 0,
          subtotal_price: 0,
          tax_amount: 0,
          total_price: 0,
          status: 'draft',
          valid_till: '',
          notes: '',
          isEdit,
        },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          quote_number: currentRow.quote_number,
          currency_code: currentRow.currency_code,
          default_margin_pct: currentRow.default_margin_pct,
          tax_pct: currentRow.tax_pct,
          subtotal_cost: currentRow.subtotal_cost,
          subtotal_price: currentRow.subtotal_price,
          tax_amount: currentRow.tax_amount,
          total_price: currentRow.total_price,
          status: currentRow.status as QuoteForm['status'],
          valid_till: currentRow.valid_till || '',
          notes: currentRow.notes || '',
          isEdit,
        })
      } else {
        form.reset({
          quote_number: '',
          currency_code: 'USD',
          default_margin_pct: 0,
          tax_pct: null,
          subtotal_cost: 0,
          subtotal_price: 0,
          tax_amount: 0,
          total_price: 0,
          status: 'draft',
          valid_till: '',
          notes: '',
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (values: QuoteForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {

      const now = new Date().toISOString()
      const quoteData: Quote = {
        id: currentRow?.id || '', // Will be generated on server if empty
        requirement_id: currentRow?.requirement_id || '',
        client_id: currentRow?.client_id || '',
        quote_number: values.quote_number || '',
        currency_code: values.currency_code || '',
        default_margin_pct: values.default_margin_pct || 0,
        tax_pct: values.tax_pct || null,
        subtotal_cost: values.subtotal_cost || 0,
        subtotal_price: values.subtotal_price || 0,
        tax_amount: values.tax_amount || 0,
        total_price: values.total_price || 0,
        status: values.status as QuoteForm['status'],
        valid_till: values.valid_till || '',
        notes: values.notes || null,
        created_by: currentRow?.created_by  || '',
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      if (isEdit) {
        await updateQuote(quoteData)
      } else {
        await addQuote(quoteData)
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
                  name='quote_number'
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
                name='currency_code'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Currency Code *
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value || 'USD'}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                        placeholder='USD'
                        className='col-span-4'
                        isControlled={true}
                        items={currencyOptions.map((currency) => ({
                          label: currency.symbol,
                          value: currency.isoCode,
                        }))}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='default_margin_pct'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Default Margin % *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='10'
                        className='col-span-4'
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            form.handleSubmit(onSubmit)
                          }
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
                    name='tax_pct'
                    render={({ field }) => (
                      <FormItem className='max-w-[140px]'>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='10'
                            className='w-full'
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e.target.value)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                form.handleSubmit(onSubmit)
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='subtotal_cost'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                        <Input
                            type="number"
                            placeholder="1000"
                            className='w-full'
                            value={field.value || ''}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                form.handleSubmit(onSubmit)
                              }
                            }}
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
                name='subtotal_price'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Subtotal Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                          placeholder='1000'
                        className='col-span-4'
                        value={field.value || ''}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            form.handleSubmit(onSubmit)
                          }
                        }}
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
                name='tax_amount'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Tax Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='1234567890'
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
                name='total_price'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Total Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='1000'
                        className='col-span-4'
                        value={field.value || ''}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            form.handleSubmit(onSubmit)
                          }
                        }}
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
                name='valid_till'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Valid Till</FormLabel>
                    <FormControl>
                      <Input
                          type='date'
                        placeholder='2025-01-01'
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
                name='notes'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Notes</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Add any notes about this quote...'
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
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Status *</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value || 'draft'}
                      onValueChange={(value) => {
                        console.log('Status changed to:', value)
                        field.onChange(value)
                      }}
                      placeholder='Select a status'
                      className='col-span-4'
                      isControlled={true}
                      items={quoteStatusOptions.map(({ label, value }: { label: string; value: string }) => ({
                        label,
                        value,
                      }))}
                    />
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
