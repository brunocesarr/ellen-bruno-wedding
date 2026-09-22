import { z } from 'zod'

export const GuestManagerLinkSchema = z.object({
  id: z.string().uuid(),
  token: z.string().uuid(),
  label: z.string().min(1).max(120),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  useCount: z.number().int().min(0),
  lastUsedAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type GuestManagerLink = z.infer<typeof GuestManagerLinkSchema>

/** Offered in the admin UI; `undefined` means the link never expires. */
export const EXPIRY_CHOICES_IN_DAYS = [30, 90, 180] as const

export const CreateGuestManagerLinkInputSchema = z.object({
  label: z
    .string()
    .max(120, 'Rótulo muito longo')
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),
  /** Absent = no expiry. A link with no expiry is revoked by hand, nothing else. */
  expiresInDays: z.coerce
    .number()
    .int()
    .min(1)
    .max(365, 'Prazo muito longo')
    .optional(),
})
export type CreateGuestManagerLinkInput = z.infer<
  typeof CreateGuestManagerLinkInputSchema
>

export const RevokeGuestManagerLinkInputSchema = z.object({
  id: z.string().uuid(),
})

/** Same shape as InviteTokenSchema, but its own message. */
export const GuestManagerTokenSchema = z.string().uuid('Acesso inválido')
