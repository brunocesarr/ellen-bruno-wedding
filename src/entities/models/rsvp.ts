import { z } from 'zod'

export const RsvpSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  attending: z.boolean(),
  companions: z.number().int().min(0).max(5),
  dietaryRestrictions: z.string().max(500).nullable(),
  message: z.string().max(1000).nullable(),
  createdAt: z.date(),
})
export type Rsvp = z.infer<typeof RsvpSchema>

export const CreateRsvpInputSchema = z.object({
  fullName: z.string().min(2, 'Nome muito curto').max(120),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  phone: z.string().optional(),
  attending: z.coerce.boolean(),
  companions: z.coerce.number().int().min(0).max(5).default(0),
  dietaryRestrictions: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
})
export type CreateRsvpInput = z.infer<typeof CreateRsvpInputSchema>
