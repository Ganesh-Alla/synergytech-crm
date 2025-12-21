'use client'

import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
import { type Requirement, requirementStatusSchema, requirementPrioritySchema, type RequirementItem } from './schema'
import { useRequirementsStore } from '@/store/requirementsStore'
import { useUserStore } from '@/store/userStore'
import { useState, useEffect } from 'react'
import { requirementPriority, requirementStatus } from './requirements-columns'
import { useAuthUserStore } from '@/store/authUserStore'
import { useClientsStore } from '@/store/clientsStore'
import { Textarea } from '@/components/ui/textarea'
import { currencyOptions } from '@/lib/currency'
import { useSearchParams } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

/* ------------------ Items schema ------------------ */
const requirementItemFormSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  item_description: z.string().nullable().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_of_measure: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
})

const formSchema = z.object({
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
  items: z
    .array(requirementItemFormSchema)
    .min(1, 'At least one item is required'),
})

type RequirementForm = z.infer<typeof formSchema>

const NewRequirementForm = ({ currentRow }: { currentRow?: Requirement }) => {
  const searchParams = useSearchParams()
  const currentClientId = searchParams.get('clientId')
  const router = useRouter()

  const isEdit = !!currentRow
  const { addRequirement, updateRequirement } = useRequirementsStore()
  const { user: currentUser } = useUserStore()
  const { clients, loadClients } = useClientsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { authUsers, loadAuthUsers } = useAuthUserStore()

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await loadClients()
      await loadAuthUsers()
      setIsLoading(false)
    }
    loadData()
  }, [loadClients, loadAuthUsers])

  const form = useForm<RequirementForm>({
    resolver: zodResolver(formSchema),
    defaultValues:
      isEdit && currentRow
        ? {
            client_id: currentRow.client_id,
            currency_code: currentRow.currency_code ?? 'USD',
            title: currentRow.title,
            description: currentRow.description,
            status: currentRow.status,
            priority: currentRow.priority,
            required_by_date: currentRow.required_by_date,
            estimated_budget_number: currentRow.estimated_budget_number ?? null,
            estimated_budget: currentRow.estimated_budget ?? '',
            assigned_to: currentRow.assigned_to,
            isEdit,
            // For now, when editing, user can add new items or we load them later
            items: [
              {
                item_name: '',
                item_description: null,
                quantity: 1,
                unit_of_measure: null,
                category: null,
              },
            ],
          }
        : {
            client_id: currentClientId || '',
            currency_code: 'USD',
            title: '',
            description: '',
            status: 'new',
            priority: 'low',
            required_by_date: null,
            estimated_budget_number: null,
            estimated_budget: '',
            assigned_to: null,
            isEdit,
            items: [
              {
                item_name: '',
                item_description: null,
                quantity: 1,
                unit_of_measure: null,
                category: null,
              },
            ],
          },
  })

  useEffect(() => {
    if (isEdit && currentRow) {
      form.reset({
        client_id: currentRow.client_id,
        currency_code: currentRow.currency_code ?? 'USD',
        title: currentRow.title,
        description: currentRow.description,
        status: currentRow.status,
        priority: currentRow.priority,
        required_by_date: currentRow.required_by_date,
        estimated_budget_number: currentRow.estimated_budget_number ?? null,
        estimated_budget: currentRow.estimated_budget ?? '',
        assigned_to: currentRow.assigned_to,
        isEdit,
        items: [
          {
            item_name: '',
            item_description: null,
            quantity: 1,
            unit_of_measure: null,
            category: null,
          },
        ],
      })
    } else {
      form.reset({
        client_id: currentClientId || '',
        currency_code: 'USD',
        title: '',
        description: '',
        status: 'new',
        priority: 'low',
        required_by_date: null,
        estimated_budget_number: null,
        estimated_budget: '',
        assigned_to: null,
        isEdit,
        items: [
          {
            item_name: '',
            item_description: null,
            quantity: 1,
            unit_of_measure: null,
            category: null,
          },
        ],
      })
    }
  }, [currentRow, isEdit, form, currentClientId])

  /* ------------------ Dynamic items ------------------ */
  const { fields: itemFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const assignableUsers =
    authUsers?.filter(
      (user) => user.permission !== 'admin' && user.permission !== 'super_admin'
    ) || []

  const onSubmit = async (values: RequirementForm) => {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    try {
      const { items, ...rest } = values

      // Concatenate currency code with budget
      let fullEstimatedBudget: string | null = null
      if (rest.estimated_budget_number) {
        const currency = currencyOptions.find((c) => c.isoCode === rest.currency_code)
        const currencySymbol = currency?.symbol || '$'
        fullEstimatedBudget = `${currencySymbol}${rest.estimated_budget_number}`
      }

      const now = new Date().toISOString()
      const requirementData: Requirement = {
        id: currentRow?.id || '', // Will be generated on server if empty
        client_id: rest.client_id,
        title: rest.title,
        description: rest.description,
        status: rest.status,
        priority: rest.priority,
        required_by_date: rest.required_by_date,
        estimated_budget: fullEstimatedBudget,
        assigned_to: rest.assigned_to,
        created_by: currentRow?.created_by || currentUser?.id || '',
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      const requirementItems = items.map((item) => ({
        ...item,
        item_description: item.item_description ?? null,
        unit_of_measure: item.unit_of_measure ?? null,
        category: item.category ?? null,
      }))

      console.log('requirementData', requirementData)
      console.log('requirementItems', requirementItems)


      if (isEdit) {
        await updateRequirement(requirementData, requirementItems as RequirementItem[])
      } else {
        await addRequirement(requirementData, requirementItems  as RequirementItem[])
      }


      form.reset()
      router.push(`/app/requirements`)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="min-h-75 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="requirement-form"
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit(
                  onSubmit,
                  (errors) => {
                    console.log('Form validation failed:', errors)
                  }
                )(e)
              }}
              className="space-y-4 px-0.5"
            >
              {/* Client + Assigned To */}
              <div className="grid grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem className="col-span-3 space-y-1">
                      <FormLabel>Client Code</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={
                            field.value === null
                              ? '__none__'
                              : field.value || undefined
                          }
                          onValueChange={(value) => {
                            field.onChange(value === '__none__' ? null : value)
                          }}
                          placeholder="Select a client"
                          className="w-full"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem className="col-span-3 space-y-1">
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={
                            field.value === null
                              ? '__none__'
                              : field.value || undefined
                          }
                          onValueChange={(value) => {
                            field.onChange(value === '__none__' ? null : value)
                          }}
                          placeholder="Select a user"
                          className="w-full"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
  
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Requirement Title"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Requirement Description"
                        {...field}
                        value={field.value || ''}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              {/* Status + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value || 'new'}
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                          placeholder="Select Status"
                          className="w-full"
                          isControlled={true}
                          items={requirementStatus.map((status) => ({
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
                    <FormItem className="space-y-1">
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          defaultValue={field.value || 'low'}
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                          placeholder="Select Priority"
                          className="w-full"
                          isControlled={true}
                          items={requirementPriority.map((priority) => ({
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
  
              {/* Required By + Estimated Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="required_by_date"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Required By Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Required By Date"
                          {...field}
                          value={
                            field.value
                              ? typeof field.value === 'string'
                                ? field.value
                                : new Date(field.value).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value || null)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div className="space-y-1">
                  <FormLabel>Estimated Budget</FormLabel>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="currency_code"
                      render={({ field }) => (
                        <FormItem className="max-w-[120px]">
                          <FormControl>
                            <SelectDropdown
                              defaultValue={field.value || 'USD'}
                              onValueChange={(value) => {
                                field.onChange(value)
                              }}
                              placeholder="Currency"
                              className="w-full"
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
                      name="estimated_budget_number"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '') {
                                  field.onChange(null)
                                  return
                                }
                                field.onChange(parseFloat(value))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
  
              {/* Requirement Items */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Requirement Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        item_name: '',
                        item_description: null,
                        quantity: 1,
                        unit_of_measure: null,
                        category: null,
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
  
                {itemFields.map((item, index) => {
                  const isLast = index === itemFields.length - 1
  
                  return (
                    <div
                      key={item.id}
                      className="border rounded-md p-3 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs text-muted-foreground">
                          Item {index + 1}
                        </span>
                        {itemFields.length > 1 && isLast && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
  
                      {/* Item Name + Quantity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.item_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Item name"
                                  autoComplete="off"
                                  {...field}
                                  disabled={!isLast}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
  
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '') {
                                      field.onChange(null)
                                      return
                                    }
                                    field.onChange(parseFloat(value))
                                  }}
                                  disabled={!isLast}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
  
                      {/* Description */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Item description"
                                rows={2}
                                {...field}
                                value={field.value || ''}
                                disabled={!isLast}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
  
                      {/* Unit of Measure + Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit_of_measure`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit of Measure</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="pcs, kg, hrs..."
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === '' ? null : e.target.value
                                    )
                                  }
                                  disabled={!isLast}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
  
                        <FormField
                          control={form.control}
                          name={`items.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="hardware / software / service"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === '' ? null : e.target.value
                                    )
                                  }
                                  disabled={!isLast}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
  
                {/* Optional form-level error for items array */}
                {form.formState.errors.items ? (
                    <FormMessage>
                    {form.formState.errors.items.message}
                  </FormMessage>
                ) : null}
              </div>
            </form>
          </Form>
          <Button
            type="submit"
            form="requirement-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save changes'}
          </Button>
        </div>
      )}
    </div>
  )
  
}

export default NewRequirementForm
