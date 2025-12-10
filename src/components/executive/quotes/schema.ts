import { z } from 'zod'

export const QuoteStatusSchema = z.union([
  z.literal('draft'),
  z.literal('sent'),
  z.literal('accepted'),
  z.literal('rejected'),
  z.literal('expired'),
])
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>

export const QuoteSchema = z.object({
    id: z.string().uuid(),
    requirement_id: z.string().uuid(),
    client_id: z.string().uuid(),
  
    quote_number: z.string(),            // human-readable code
    currency_code: z.string(),           // 'INR', 'USD', etc.
  
    default_margin_pct: z.number(),      // applies to items by default
    tax_pct: z.number().nullable(),      // can be null if no tax
  
    subtotal_cost: z.number(),           // sum of item costs
    subtotal_price: z.number(),          // sum of item prices
    tax_amount: z.number(),
    total_price: z.number(),
  
    status: QuoteStatusSchema,
    valid_till: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  
    notes: z.string().nullable(),
  
    created_by: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  
  export type Quote = z.infer<typeof QuoteSchema>
  export const QuoteListSchema = z.array(QuoteSchema)

  export const QuoteItemSchema = z.object({
    id: z.string().uuid(),
    quote_id: z.string().uuid(),
  
    requirement_item_id: z.string().uuid().nullable(),
    vendor_id: z.string().uuid().nullable(),
    vendor_quote_id: z.string().uuid().nullable(),
  
    description: z.string(),        // what client sees
    quantity: z.number(),
  
    unit_cost: z.number(),          // internal cost
    margin_pct: z.number(),         // can override default_margin_pct
    unit_price: z.number(),         // cost * (1 + margin%)
    total_cost: z.number(),         // unit_cost * qty
    total_price: z.number(),        // unit_price * qty
  
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  
  export type QuoteItem = z.infer<typeof QuoteItemSchema>
  export const QuoteItemListSchema = z.array(QuoteItemSchema)
  