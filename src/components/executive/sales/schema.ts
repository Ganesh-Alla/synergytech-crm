import { z } from 'zod'

export const salesOrderStatusSchema = z.union([
  z.literal('draft'),
  z.literal('confirmed'),
  z.literal('in_progress'),
  z.literal('delivered'),
  z.literal('cancelled'),
])
export type SalesOrderStatus = z.infer<typeof salesOrderStatusSchema>

export const salesOrderSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  requirement_id: z.string().uuid().nullable(),
  synergy_quote_id: z.string().uuid().nullable(),

  order_number: z.string(),
  status: salesOrderStatusSchema,
  order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  currency_code: z.string(),

  total_cost: z.number(),
  total_price: z.number(),

  notes: z.string().nullable(),

  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type SalesOrder = z.infer<typeof salesOrderSchema>
export const salesOrderListSchema = z.array(salesOrderSchema)

export const salesOrderItemSchema = z.object({
  id: z.string().uuid(),
  sales_order_id: z.string().uuid(),
  synergy_quote_item_id: z.string().uuid().nullable(),
  requirement_item_id: z.string().uuid().nullable(),

  description: z.string(),
  quantity: z.number(),

  unit_cost: z.number(),
  unit_price: z.number(),
  total_cost: z.number(),
  total_price: z.number(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type SalesOrderItem = z.infer<typeof salesOrderItemSchema>
export const salesOrderItemListSchema = z.array(salesOrderItemSchema)
