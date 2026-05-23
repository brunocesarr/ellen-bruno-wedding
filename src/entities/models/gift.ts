import { z } from 'zod'

export const GiftSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable(),
  price: z.number().positive(),
  imagePath: z.string().nullable(),
  isReserved: z.boolean(),
  reservedByName: z.string().nullable(),
  reservedByEmail: z.string().nullable(),
  reservedAt: z.date().nullable(),
})
export type Gift = z.infer<typeof GiftSchema>

export const ReserveGiftInputSchema = z.object({
  giftId: z.string().uuid(),
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
})
export type ReserveGiftInput = z.infer<typeof ReserveGiftInputSchema>

export const CreateGiftInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive(),
  imagePath: z.string().optional(),
})
export type CreateGiftInput = z.infer<typeof CreateGiftInputSchema>

export const UpdateGiftInputSchema = CreateGiftInputSchema.partial().extend({
  id: z.string().uuid(),
})
export type UpdateGiftInput = z.infer<typeof UpdateGiftInputSchema>
