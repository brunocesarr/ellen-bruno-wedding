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
  isChild: z.boolean(),
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
  isChild: z.boolean().optional(),

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

export const AssignGuestPartyInputSchema = z.object({
  guestId: z.string().uuid(),
  targetGuestId: z.string().uuid(),
})
export type AssignGuestPartyInput = z.infer<typeof AssignGuestPartyInputSchema>

export const RenameGuestNamesInputSchema = z.object({
  inviteToken: z.string().uuid('Convite inválido'),

  names: z
    .array(
      z.object({
        guestId: z.string().uuid(),
        firstName: z.string().min(1, 'Informe o primeiro nome').max(80),
        lastName: z.string().min(1, 'Informe o sobrenome').max(80),
      })
    )
    .min(1),
})
export type RenameGuestNamesInput = z.infer<typeof RenameGuestNamesInputSchema>

/**
 * What a login-free guest-manager link is allowed to see.
 *
 * Deliberately omits `inviteToken` / `partyInviteToken`: a manager link covers
 * the WHOLE list, so shipping those would turn one shared URL into every
 * household's personal invite link. `notes` stays out too — it is the couple's
 * private scratchpad, not something a helper needs to rename someone.
 */
export const ManagedGuestSchema = GuestSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  status: true,
  partyId: true,
})
export type ManagedGuest = z.infer<typeof ManagedGuestSchema>

/**
 * The only write a manager link can perform. There is no `id`-only passthrough
 * to UpdateGuestInputSchema on purpose: `notes` and `partyId` are not theirs to
 * change, and the repository method this feeds is narrowed to match.
 */
export const UpdateManagedGuestInputSchema = z
  .object({
    token: z.string().uuid('Acesso inválido'),
    guestId: z.string().uuid(),
    firstName: z.string().min(1, 'Informe o primeiro nome').max(80).optional(),
    lastName: z.string().min(1, 'Informe o sobrenome').max(80).optional(),
    status: GuestStatusSchema.optional(),
  })
  .refine(
    (v) =>
      v.firstName !== undefined ||
      v.lastName !== undefined ||
      v.status !== undefined,
    { message: 'Nada para atualizar', path: ['guestId'] }
  )
export type UpdateManagedGuestInput = z.infer<
  typeof UpdateManagedGuestInputSchema
>
