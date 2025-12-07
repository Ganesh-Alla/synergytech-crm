import { z } from 'zod'

const industrySchema = z.union([
  z.literal('Technology'),
  z.literal('Manufacturing'),
  z.literal('Healthcare'),
  z.literal('Finance'),
  z.literal('Retail'),
  z.literal('Education'),
  z.literal('Real Estate'),
  z.literal('Consulting'),
  z.literal('Other'),
])
export type Industry = z.infer<typeof industrySchema>

const clientSchema = z.object({
  id: z.string().uuid(),
  client_code: z.string(),
  company_name: z.string().nullable(),
  contact_name: z.string(),
  contact_email: z.string().email(),
  contact_phone: z.string().nullable(),
  industry: industrySchema.nullable(),
  website: z.string().nullable(),
  last_interaction_at: z.string().datetime().nullable(),
  next_follow_up_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  notes: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Client = z.infer<typeof clientSchema>

export const clientListSchema = z.array(clientSchema)
