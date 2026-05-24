import { z } from 'zod'

// ─── Existing ───────────────────────────────────────────────
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

// ─── New: persisted entity ──────────────────────────────────
export const PixConfirmationSchema = z.object({
  id: z.string().uuid(),
  giftId: z.string().uuid().nullable(), // matches DB nullable FK
  guestName: z.string(),
  amount: z.number(),
  confirmed: z.boolean(),
  createdAt: z.date(),
})
export type PixConfirmation = z.infer<typeof PixConfirmationSchema>
