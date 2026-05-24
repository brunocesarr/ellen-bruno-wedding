import { z } from 'zod'

export const GiftCategorySchema = z.enum([
  'home',
  'kitchen',
  'travel',
  'experience',
  'other',
])
export type GiftCategory = z.infer<typeof GiftCategorySchema>

export const GiftSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable(),
  price: z.number().positive(),
  imagePath: z.string().nullable(),
  isReserved: z.boolean(),
  reservedByName: z.string().nullable(),
  reservedByEmail: z.string().nullable(),
  reservedMessage: z.string().nullable(),
  reservedAt: z.date().nullable(),
  category: GiftCategorySchema,
})
export type Gift = z.infer<typeof GiftSchema>

export const ReserveGiftInputSchema = z.object({
  giftId: z.string().uuid(),
  name: z.string().min(2, 'Informe seu nome').max(120),
  message: z.string().max(500).optional(),
})
export type ReserveGiftInput = z.infer<typeof ReserveGiftInputSchema>

export const CreateGiftInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive(),
  imagePath: z.string().optional(),
  category: GiftCategorySchema.default('other'),
})
export type CreateGiftInput = z.infer<typeof CreateGiftInputSchema>

export const UpdateGiftInputSchema = CreateGiftInputSchema.partial().extend({
  id: z.string().uuid(),
})
export type UpdateGiftInput = z.infer<typeof UpdateGiftInputSchema>
