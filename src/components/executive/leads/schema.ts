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
  id: z.uuid(),
  client_code: z.string().nullable().optional(),
  contact_name: z.string(),
  contact_email: z.email(),
  contact_phone: z.string().nullable(),
  source: leadSourceSchema,
  status: leadStatusSchema,
  assigned_to: z.uuid().nullable().optional(),
  assigned_to_name: z.string().nullable().optional(), // Computed field, not from DB
  follow_up_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  notes: z.string().nullable(),
  created_by: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})
export type Lead = z.infer<typeof leadSchema>

export const leadListSchema = z.array(leadSchema)