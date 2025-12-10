import { z } from 'zod'

export const expenseCategoryCodeSchema = z.union([
  z.literal('food'),
  z.literal('cab'),
  z.literal('client_gift'),
  z.literal('laundry'),
  z.literal('accommodation'),
  z.literal('other'),
])
export type ExpenseCategoryCode = z.infer<typeof expenseCategoryCodeSchema>

export const expenseCategorySchema = z.object({
  id: z.number().int(),
  code: expenseCategoryCodeSchema,
  name: z.string(),
})
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>

export const expenseCategoryListSchema = z.array(expenseCategorySchema)

export const expenseStatusSchema = z.union([
  z.literal('submitted'),
  z.literal('approved'),
  z.literal('rejected'),
])
export type ExpenseStatus = z.infer<typeof expenseStatusSchema>

export const expenseSchema = z.object({
  id: z.string().uuid(),

  executive_id: z.string().uuid(),          // profiles.id
  client_id: z.string().uuid().nullable(),  // optional
  requirement_id: z.string().uuid().nullable(),
  category_code: expenseCategoryCodeSchema, // denormalized for convenience
  category_id: z.number().int().nullable(), // FK to expense_categories

  amount: z.number(),
  currency_code: z.string(),                // 'INR', 'USD', etc.

  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  merchant_name: z.string().nullable(),
  bill_number: z.string().nullable(),
  notes: z.string().nullable(),
  receipt_url: z.string().nullable(),       // Supabase storage

  status: expenseStatusSchema,
  approved_by: z.string().uuid().nullable(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Expense = z.infer<typeof expenseSchema>

export const expenseListSchema = z.array(expenseSchema)
