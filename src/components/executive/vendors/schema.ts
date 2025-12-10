import { z } from 'zod'

/* ----------------------------------------
   Vendor Status Enum
----------------------------------------- */
export const vendorStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type VendorStatus = z.infer<typeof vendorStatusSchema>

/* ----------------------------------------
   Vendors Table Schema
----------------------------------------- */
export const vendorSchema = z.object({
  id: z.string().uuid(),
  vendor_code: z.string(),                 // unique code like client_code
  company_name: z.string(),
  contact_name: z.string().nullable(),
  contact_email: z.string().email().nullable(),
  contact_phone: z.string().nullable(),

  gst_number: z.string().nullable(),
  address: z.string().nullable(),
  payment_terms: z.string().nullable(),     // ex: Net 15, Net 30

  status: vendorStatusSchema.default('active'),
  notes: z.string().nullable(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})
export type Vendor = z.infer<typeof vendorSchema>

export const vendorListSchema = z.array(vendorSchema)
