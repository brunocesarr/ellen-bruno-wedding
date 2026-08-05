import { z } from 'zod'

export const RSVP_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const
export const RsvpRequestStatusSchema = z.enum(RSVP_REQUEST_STATUSES)
export type RsvpRequestStatus = z.infer<typeof RsvpRequestStatusSchema>

export const RsvpRequestSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  attending: z.boolean(),
  message: z.string().max(1000).nullable(),
  status: RsvpRequestStatusSchema,
  guestId: z.string().uuid().nullable(),
  decidedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type RsvpRequest = z.infer<typeof RsvpRequestSchema>

/**
 * `guests.last_name` is NOT NULL, so a single-word name cannot be split into a
 * valid guest record. We therefore require at least two words up front.
 */
const fullNameSchema = z
  .string()
  .min(2, 'Nome muito curto')
  .max(120, 'Nome muito longo')
  .transform((v) => v.trim().replace(/\s+/g, ' '))
  .refine(
    (v) => v.split(' ').length >= 2,
    'Por favor, informe nome e sobrenome'
  )

export const CreateRsvpRequestInputSchema = z.object({
  fullName: fullNameSchema,
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  attending: z.coerce.boolean(),
  message: z
    .string()
    .max(1000, 'Mensagem muito longa')
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),
})
export type CreateRsvpRequestInput = z.infer<
  typeof CreateRsvpRequestInputSchema
>

export const DecideRsvpRequestInputSchema = z.object({
  id: z.string().uuid('Solicitação inválida'),
  decision: z.enum(['approved', 'rejected']),
})
export type DecideRsvpRequestInput = z.infer<
  typeof DecideRsvpRequestInputSchema
>
