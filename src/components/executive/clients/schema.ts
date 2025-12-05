import { z } from 'zod'

const clientSourceSchema = z.union([
  z.literal('website'),
  z.literal('referral'),
  z.literal('email'),
  z.literal('phone'),
  z.literal('event'),
  z.literal('whatsapp'),
])
export type ClientSource = z.infer<typeof clientSourceSchema>

const clientSchema = z.object({
  id: z.string().uuid(),
  client_code: z.string(),
  company_name: z.string().nullable(),
  contact_name: z.string(),
  contact_email: z.string().email(),
  contact_phone: z.string().nullable(),
  industry: z.string().nullable(),
  website: z.string().nullable(),
  source: clientSourceSchema,
  account_owner: z.string().uuid().nullable(),
  last_interaction_at: z.string().datetime().nullable(),
  next_follow_up_at: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Client = z.infer<typeof clientSchema>

export const clientListSchema = z.array(clientSchema)
