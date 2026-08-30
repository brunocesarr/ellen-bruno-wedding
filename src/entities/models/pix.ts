import { z } from 'zod'

export const PixQrSchema = z.object({
  brCode: z.string(),
  qrImage: z.string(),
})
export type PixQr = z.infer<typeof PixQrSchema>

export const PAYMENT_METHODS = ['pix', 'card'] as const
export const PaymentMethodSchema = z.enum(PAYMENT_METHODS)
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

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
  paymentMethod: PaymentMethodSchema,
  mpPaymentId: z.string().nullable(),
  createdAt: z.date(),
})
export type PixConfirmation = z.infer<typeof PixConfirmationSchema>

/**
 * Input for "pay by card" — same shape as ReserveGiftInputSchema (giftId,
 * name, message, optional amount required only for open_item/fund) since
 * the guest fills this in *before* being redirected to Mercado Pago, not
 * after paying like the PIX-side ReserveGiftForm.
 */
export const CreateCardPaymentInputSchema = z.object({
  giftId: z.string().uuid(),
  name: z.string().min(2, 'Informe seu nome').max(120),
  message: z.string().max(500).optional(),
  amount: z.coerce
    .number()
    .positive('Informe um valor maior que zero')
    .max(50_000)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, {
      message: 'Use no máximo 2 casas decimais',
    })
    .optional(),
})
export type CreateCardPaymentInput = z.infer<
  typeof CreateCardPaymentInputSchema
>

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
