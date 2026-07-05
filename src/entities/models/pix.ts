import { z } from 'zod'

export const PixQrSchema = z.object({
  brCode: z.string(),
  qrImage: z.string(),
})
export type PixQr = z.infer<typeof PixQrSchema>

export const PixConfirmationInputSchema = z.object({
  giftId: z.string().uuid().optional(),
  guestName: z.string().min(2),
  amount: z.coerce.number().positive(),
})
export type PixConfirmationInput = z.infer<typeof PixConfirmationInputSchema>

export const PixConfirmationSchema = z.object({
  id: z.string().uuid(),
  giftId: z.string().uuid().nullable(),
  guestName: z.string(),
  amount: z.number(),
  confirmed: z.boolean(),
  createdAt: z.date(),
})
export type PixConfirmation = z.infer<typeof PixConfirmationSchema>
