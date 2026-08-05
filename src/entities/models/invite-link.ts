import type { Guest } from '@/src/entities/models/guest'
import { z } from 'zod'

export const InviteLinkSchema = z.object({
  id: z.string().uuid(),
  token: z.string().uuid(),
  label: z.string().min(1).max(120),
  isActive: z.boolean(),
  visitCount: z.number().int().min(0),
  lastVisitedAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type InviteLink = z.infer<typeof InviteLinkSchema>

export const CreateInviteLinkInputSchema = z.object({
  label: z
    .string()
    .max(120, 'Rótulo muito longo')
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),
})
export type CreateInviteLinkInput = z.infer<typeof CreateInviteLinkInputSchema>

export const InviteTokenSchema = z.string().uuid('Convite inválido')

/**
 * How a token was resolved.
 *
 * 'guest'  — a personalised or party token: full invitation + tokenised RSVP.
 * 'shared' — a generic shareable token: full invitation, but the RSVP screen
 *            falls back to the "request pending approval" flow, exactly as it
 *            behaves with no token at all.
 */
export type InviteAccess =
  | { kind: 'guest'; guest: Guest; partyMembers: Guest[] }
  | { kind: 'shared'; link: InviteLink }
