import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('super_admin'),
  z.literal('admin'),
  z.literal('read'),
  z.literal('write'),
  z.literal('full_access'),
])

const userSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  status: userStatusSchema,
  permission: userRoleSchema,
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)