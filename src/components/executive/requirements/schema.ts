import { z } from 'zod'

/* ----------------------------------------
   Requirement Status Enum
----------------------------------------- */
export const requirementStatusSchema = z.union([
  z.literal('new'),
  z.literal('in_discussion'),
  z.literal('quoted'),
  z.literal('on_hold'),
  z.literal('closed'),
])
export type RequirementStatus = z.infer<typeof requirementStatusSchema>

/* ----------------------------------------
   Requirement Priority Enum
----------------------------------------- */
export const requirementPrioritySchema = z.union([
  z.literal('low'),
  z.literal('medium'),
  z.literal('high'),
])
export type RequirementPriority = z.infer<typeof requirementPrioritySchema>

/* ----------------------------------------
   Requirement Schema
----------------------------------------- */
export const requirementSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  client_code: z.string().nullable().optional(),
  currency_code: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable(),

  status: requirementStatusSchema,
  priority: requirementPrioritySchema.nullable(),

  required_by_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  estimated_budget_number: z.number().nullable().optional(),
  estimated_budget: z.string().nullable(),

  assigned_to: z.string().uuid().nullable(), 
  assigned_to_name: z.string().nullable().optional(),
  created_by: z.string().uuid(),

  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})
export type Requirement = z.infer<typeof requirementSchema>

export const requirementListSchema = z.array(requirementSchema)

/* ----------------------------------------
   Requirement Item Schema
----------------------------------------- */
export const requirementItemSchema = z.object({
  id: z.string().uuid(),
  requirement_id: z.string().uuid(),

  item_name: z.string(),
  item_description: z.string().nullable(),

  quantity: z.number(),
  unit_of_measure: z.string().nullable(),   // pcs, kg, hours, etc.
  category: z.string().nullable(),          // hardware/software/service

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type RequirementItem = z.infer<typeof requirementItemSchema>

export const requirementItemListSchema = z.array(requirementItemSchema)
