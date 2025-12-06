import { z } from 'zod'

const leadStatusSchema = z.union([
  z.literal('new'),
  z.literal('in_progress'),
  z.literal('won'),
  z.literal('lost'),
])
export type LeadStatus = z.infer<typeof leadStatusSchema>

const leadSourceSchema = z.union([
  z.literal('website'),
  z.literal('referral'),
  z.literal('email'),
  z.literal('phone'),
  z.literal('event'),
  z.literal('whatsapp'),
])
export type LeadSource = z.infer<typeof leadSourceSchema>

const leadSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid().nullable(),
  contact_name: z.string(),
  contact_email: z.string().email(),
  contact_phone: z.string().nullable(),
  company_name: z.string().nullable(),
  source: leadSourceSchema,
  status: leadStatusSchema,
  assigned_to: z.string().uuid().nullable(),
  follow_up_at: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Display fields from joins
  client_code: z.string().nullable().optional(),
  assigned_to_name: z.string().nullable().optional(),
})
export type Lead = z.infer<typeof leadSchema>

export const leadListSchema = z.array(leadSchema)