import { z } from 'zod'

export const vendorQuoteStatusSchema = z.union([
  z.literal('received'),
  z.literal('shortlisted'),
  z.literal('approved'),
  z.literal('rejected'),
])
export type VendorQuoteStatus = z.infer<typeof vendorQuoteStatusSchema>

export const requirementVendorQuoteSchema = z.object({
  id: z.string().uuid(),
  requirement_id: z.string().uuid(),
  requirement_item_id: z.string().uuid().nullable(),
  vendor_id: z.string().uuid(),

  currency_code: z.string(),           // e.g. 'INR', 'USD'
  base_cost: z.number(),
  additional_costs: z.number().nullable(),
  total_cost: z.number(),              // computed on backend

  vendor_quote_ref: z.string().nullable(),  // their quote number / reference
  valid_till: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),

  status: vendorQuoteStatusSchema,
  notes: z.string().nullable(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type RequirementVendorQuote = z.infer<typeof requirementVendorQuoteSchema>

export const requirementVendorQuoteListSchema = z.array(requirementVendorQuoteSchema)
