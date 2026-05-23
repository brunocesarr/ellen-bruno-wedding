import { z } from 'zod'

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
})
export type AdminUser = z.infer<typeof AdminUserSchema>

export const SignInInputSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha muito curta'),
})
export type SignInInput = z.infer<typeof SignInInputSchema>
