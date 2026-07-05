import { z } from 'zod'

export const GUEST_STATUSES = ['going', 'pending', 'not_going'] as const
export const GuestStatusSchema = z.enum(GUEST_STATUSES)
export type GuestStatus = z.infer<typeof GuestStatusSchema>

export const GuestSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  status: GuestStatusSchema,
  inviteToken: z.string().uuid(),
  partyInviteToken: z.string().uuid(),
  partyId: z.string().uuid(),
  notes: z.string().max(500).nullable(),
  confirmedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Guest = z.infer<typeof GuestSchema>

export const InviteContextSchema = z.object({
  guest: GuestSchema,
  partyMembers: z.array(GuestSchema),
})
export type InviteContext = z.infer<typeof InviteContextSchema>

export const CreateGuestInputSchema = z.object({
  firstName: z.string().min(1, 'Informe o primeiro nome').max(80),
  lastName: z.string().min(1, 'Informe o sobrenome').max(80),
  status: GuestStatusSchema.default('pending'),
  notes: z.string().max(500).optional(),

  partyId: z.string().uuid().optional(),
})
export type CreateGuestInput = z.infer<typeof CreateGuestInputSchema>

export const UpdateGuestInputSchema = CreateGuestInputSchema.partial().extend({
  id: z.string().uuid(),
})
export type UpdateGuestInput = z.infer<typeof UpdateGuestInputSchema>

export const ConfirmAttendanceInputSchema = z.object({
  inviteToken: z.string().uuid('Convite inválido'),

  attendees: z
    .array(
      z.object({
        guestId: z.string().uuid(),
        status: GuestStatusSchema,
      })
    )
    .min(1),
  message: z.string().max(1000).optional(),
})
export type ConfirmAttendanceInput = z.infer<
  typeof ConfirmAttendanceInputSchema
>
