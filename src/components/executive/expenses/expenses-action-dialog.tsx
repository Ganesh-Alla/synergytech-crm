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
import type{ Expense } from './schema'
import { useState, useEffect } from 'react'
import { useExpensesStore } from '@/store/expensesStore'
import { expenseStatusOptions } from './expenses-columns'

const formSchema = z
  .object({
    id: z.string().optional().or(z.literal('')),
    executive_id: z.string().optional().or(z.literal('')),
    client_id: z.string().optional().or(z.literal('')),
    requirement_id: z.string().optional().or(z.literal('')),
    category_code: z.enum(["food", "cab", "client_gift", "laundry", "accommodation", "other"]).optional().or(z.literal('')),
    category_id: z.number().nullable().optional().or(z.literal('')),
    amount: z.number().nullable().optional().or(z.literal('')),
    currency_code: z.string().optional().or(z.literal('')),
    expense_date: z.string().optional().or(z.literal('')),
    merchant_name: z.string().optional().or(z.literal('')),
    bill_number: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    receipt_url: z.string().optional().or(z.literal('')),
    status: z.enum(["submitted", "approved", "rejected"]).optional().or(z.literal('')),
    approved_by: z.string().optional().or(z.literal('')),
    isEdit: z.boolean(),
  })
type ExpenseForm = z.infer<typeof formSchema>

type ExpensesActionDialogProps = {
  currentRow?: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpensesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ExpensesActionDialogProps) {
  const isEdit = !!currentRow
  const { addExpense, updateExpense } = useExpensesStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ExpenseForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          executive_id: currentRow.executive_id,
          client_id: currentRow.client_id || '',
          requirement_id: currentRow.requirement_id || '',
          category_code: currentRow.category_code || '',
          category_id: currentRow.category_id || null,
          amount: currentRow.amount || 0,
          currency_code: currentRow.currency_code || 'USD',
          expense_date: currentRow.expense_date || '',
          merchant_name: currentRow.merchant_name || '',
          bill_number: currentRow.bill_number || '',
          notes: currentRow.notes || '',
          receipt_url: currentRow.receipt_url || '',
          status: currentRow.status || 'submitted',
          approved_by: currentRow.approved_by || '',
        }
      : {
          executive_id: '',
          client_id: '',
          requirement_id: '',
          category_code: '',
          category_id: null,
          amount: 0,
          currency_code: 'USD',
          expense_date: '',
          merchant_name: '',
          bill_number: '',
          notes: '',
          receipt_url: '',
          status: 'submitted',
          approved_by: '',
          isEdit,
        },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          executive_id: currentRow.executive_id,
          client_id: currentRow.client_id || '',
          requirement_id: currentRow.requirement_id || '',
          category_code: currentRow.category_code || '',
          category_id: currentRow.category_id || null,
          amount: currentRow.amount || 0,
          currency_code: currentRow.currency_code || 'USD',
          expense_date: currentRow.expense_date || '',
          merchant_name: currentRow.merchant_name || '',
          bill_number: currentRow.bill_number || '',
          notes: currentRow.notes || '',
          receipt_url: currentRow.receipt_url || '',
          status: currentRow.status || 'submitted',
          approved_by: currentRow.approved_by || '',
          isEdit,
        })
      } else {
        form.reset({
          executive_id: '',
          client_id: '',
          requirement_id: '',
          category_code: '',
          category_id: null,
          amount: 0,
          currency_code: 'USD',
          expense_date: '',
          merchant_name: '',
          bill_number: '',
          notes: '',
          receipt_url: '',
          status: 'submitted',
          approved_by: '',
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (values: ExpenseForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const expenseData: Expense = {
        id: currentRow ? currentRow.id : '', // Will be generated on server if empty
        executive_id: currentRow?.executive_id || '',
        client_id: currentRow?.client_id || '',
        requirement_id: currentRow?.requirement_id || '',
        category_code: currentRow?.category_code as Expense['category_code'] || 'food',
        category_id: currentRow?.category_id || null,
        amount: currentRow?.amount || 0,
        currency_code: currentRow?.currency_code || 'USD',
        expense_date: currentRow?.expense_date || '',
        merchant_name: currentRow?.merchant_name || '',
        bill_number: currentRow?.bill_number || '',
        notes: values.notes || '',
        receipt_url: currentRow?.receipt_url || '',
        status: values.status || 'submitted',
        approved_by: values.approved_by || '',
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      if (isEdit) {
        await updateExpense(expenseData)
      } else {
        await addExpense(expenseData)
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
                  name='executive_id'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Executive ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='EXE-001'
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
                name='client_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Client ID *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        placeholder='CLT-001'
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
                    name='category_code'
                    render={({ field }) => (
                      <FormItem className='max-w-[140px]'>
                        <FormControl>
                          <Input
                            type='text'
                            defaultValue={field.value || 'food'}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e.target.value)
                            }}
                            placeholder='food'
                            className='w-full'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='category_id'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                        <Input
                            type="text"
                            placeholder="1"
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
                          field.onChange(value as ExpenseForm['status'])
                        }}
                        placeholder='Select a status'
                        className='col-span-4'
                        isControlled={true}
                        items={expenseStatusOptions.map((status: { label: string; value: string }) => ({
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
                name='receipt_url'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Receipt URL *</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='https://example.com/receipt.pdf'
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
                name='approved_by'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>Approved By</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add any notes about this expense...'
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
          <Button type='submit' form='expense-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
