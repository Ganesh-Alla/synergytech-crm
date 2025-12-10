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
  vendorStatusSchema, type Vendor } from './schema'
import { useState, useEffect } from 'react'
import { countryOptions, countryCodeToFlag, extractCountryCode } from '@/lib/phoneFlags'
import { useVendorsStore } from '@/store/vendorsStore'
import { vendorStatusOptions } from './vendors-columns'

const formSchema = z
  .object({
    vendor_code: z.string().optional().or(z.literal('')),
    company_name: z.string().nullable().optional(),
    contact_name: z.string().min(1, 'Contact Name is required.'),
    contact_email: z.string().email('Invalid email address.'),
    country_code: z.string().optional(),
    contact_phone: z.string().nullable().optional(),
    contact_number: z.string().nullable().optional(),
    gst_number: z.union([
      z.string(),
      z.null(),
      z.undefined(),
    ]).optional(),
    address: z.string().url('Invalid URL.').nullable().optional().or(z.literal('')),
    payment_terms: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
        z.literal('').transform(() => null),
        z.null(),
        z.undefined(),
      ])
      .optional(),
    status: vendorStatusSchema,
    notes: z.string().nullable().optional(),
    isEdit: z.boolean(),
  })
type VendorForm = z.infer<typeof formSchema>

type VendorActionDialogProps = {
  currentRow?: Vendor
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function VendorsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: VendorActionDialogProps) {
  const isEdit = !!currentRow
  const { addVendor, updateVendor } = useVendorsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const parsedPhone = isEdit && currentRow ? parsePhoneNumber(currentRow.contact_phone) : { countryCode: '91', phoneNumber: '' }

  const form = useForm<VendorForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
          vendor_code: currentRow.vendor_code,
          company_name: currentRow.company_name || '',
          contact_name: currentRow.contact_name || '',
          contact_email: currentRow.contact_email || '',
          country_code: parsedPhone.countryCode,
          contact_number: parsedPhone.phoneNumber || undefined,
          gst_number: currentRow.gst_number || '',
          address: currentRow.address || '',
          payment_terms: currentRow.payment_terms || '',
          status: currentRow.status as VendorForm['status'],
          notes: currentRow.notes || '',
          isEdit,
        }
      : {
          vendor_code: '',
          company_name: '',
          contact_name: '',
          contact_email: '',
          country_code: '91',
          contact_number: '',
          gst_number: null,
          address: '',
          payment_terms: '',
          status: 'active',
          notes: '',
          isEdit,
        },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        const parsed = parsePhoneNumber(currentRow.contact_phone)
        form.reset({
          vendor_code: currentRow.vendor_code,
          company_name: currentRow.company_name || '',
          contact_name: currentRow.contact_name || '',
          contact_email: currentRow.contact_email || '',
          country_code: parsed.countryCode,
          contact_number: parsedPhone.phoneNumber || undefined,
          gst_number: currentRow.gst_number || '',
          address: currentRow.address || '',
          payment_terms: currentRow.payment_terms || '',
          status: currentRow.status as VendorForm['status'],
          notes: currentRow.notes || '',
          isEdit,
        })
      } else {
        form.reset({
          vendor_code: '',
          company_name: '',
          contact_name: '',
          contact_email: '',
          country_code: '91',
          contact_number: '',
          gst_number: null,
          address: '',
          payment_terms: '',
          status: 'active',
          notes: '',
          isEdit,
        })
      }
    }
  }, [open, currentRow, isEdit, form, parsedPhone.phoneNumber])

  const onSubmit = async (values: VendorForm) => {
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
      const vendorData: Vendor = {
        id: currentRow?.id || '', // Will be generated on server if empty
        vendor_code: values.vendor_code || '', // Will be generated on server if empty
        company_name: values.company_name || '',
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        contact_phone: fullPhoneNumber,
        gst_number: values.gst_number || null,
        address: values.address || null,
        payment_terms: values.payment_terms || null,
        status: values.status as VendorForm['status'],
        notes: values.notes || null,
        created_at: currentRow?.created_at || now,
        updated_at: now,
      }

      if (isEdit) {
        await updateVendor(vendorData)
      } else {
        await addVendor(vendorData)
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
                  name='vendor_code'
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
                name='gst_number'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>GST Number</FormLabel>
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
                      items={vendorStatusOptions.map(({ label, value }: { label: string; value: string }) => ({
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
                name='address'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Address</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='123 Main St, Anytown, USA'
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
                name='payment_terms'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Payment Terms</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Net 15, Net 30'
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
