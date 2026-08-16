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

/**
 * On-demand QR for open_item / fund, where the amount is chosen by the guest
 * and therefore cannot exist at page render time.
 * The 2-decimal guard matters because PixUtilsService rounds via
 * Math.round(v * 100) / 100 — reject at the boundary instead of silently
 * turning 10.999 into 11.00. Epsilon compare: 10.99 * 100 is 1099.0000000000002.
 */
export const GeneratePixInputSchema = z.object({
  giftId: z.string().uuid(),
  amount: z.coerce
    .number()
    .positive('Informe um valor maior que zero')
    .max(50_000)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, {
      message: 'Use no máximo 2 casas decimais',
    }),
})
export type GeneratePixInput = z.infer<typeof GeneratePixInputSchema>
