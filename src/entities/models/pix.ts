import { z } from 'zod'

export const PixQrSchema = z.object({
  brCode: z.string(), // Pix copia-e-cola
  qrImage: z.string(), // base64 PNG
})
export type PixQr = z.infer<typeof PixQrSchema>

export const PixConfirmationInputSchema = z.object({
  giftId: z.string().uuid().optional(),
  guestName: z.string().min(2),
  amount: z.coerce.number().positive(),
})
export type PixConfirmationInput = z.infer<typeof PixConfirmationInputSchema>
