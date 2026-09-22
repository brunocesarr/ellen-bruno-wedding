import type { IGuestManagerLinksRepository } from '@/src/application/repositories/guest-manager-links.repository.interface'
import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { GuestManagerAccessDeniedError } from '@/src/entities/errors/guest-manager-links'
import { GuestNotFoundError } from '@/src/entities/errors/guests'
import {
  UpdateManagedGuestInputSchema,
  type Guest,
  type ManagedGuest,
} from '@/src/entities/models/guest'
import { GuestManagerTokenSchema } from '@/src/entities/models/guest-manager-link'
import { z } from 'zod'

type Deps = {
  guestManagerLinksRepo: IGuestManagerLinksRepository
  guestsRepo: IGuestsRepository
}

/**
 * The PII gate. Everything a manager link ever returns goes through here, so
 * there is exactly one place to audit for a leaked invite token.
 */
const toManagedGuest = (g: Guest): ManagedGuest => ({
  id: g.id,
  firstName: g.firstName,
  lastName: g.lastName,
  status: g.status,
  partyId: g.partyId,
})

/**
 * Unknown, revoked, expired and malformed tokens all fail the same way, so a
 * caller cannot use the error to probe which tokens exist.
 */
async function requireUsableLink(
  deps: Pick<Deps, 'guestManagerLinksRepo'>,
  raw: unknown
) {
  const parsed = GuestManagerTokenSchema.safeParse(raw)
  if (!parsed.success) throw new GuestManagerAccessDeniedError()

  const link = await deps.guestManagerLinksRepo.findUsableByToken(parsed.data)
  if (!link) throw new GuestManagerAccessDeniedError()

  return link
}

/**
 * Public, unauthenticated — the token IS the credential. Returns the whole
 * guest list in its PII-narrowed shape plus the link's own label, so the page
 * can show whose access is being used without a second round trip.
 */
export function getGuestManagerContextUseCase(deps: Deps) {
  return async (raw: unknown) => {
    const link = await requireUsableLink(deps, raw)
    const guests = await deps.guestsRepo.list()

    return {
      label: link.label,
      expiresAt: link.expiresAt,
      guests: guests.map(toManagedGuest),
    }
  }
}

/**
 * The only mutation a manager link can perform: rename a guest, or change their
 * status. Creating and deleting guests stay admin-only — there is deliberately
 * no create/delete counterpart in this file.
 */
export function updateManagedGuestUseCase(deps: Deps) {
  return async (raw: unknown) => {
    const parsed = UpdateManagedGuestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { token, guestId, firstName, lastName, status } = parsed.data

    // Token first: an invalid link must not be able to probe guest ids either.
    await requireUsableLink(deps, token)

    const guest = await deps.guestsRepo.findById(guestId)
    if (!guest) throw new GuestNotFoundError()

    const updated = await deps.guestsRepo.updateNameAndStatus({
      id: guestId,
      firstName,
      lastName,
      status,
    })

    return toManagedGuest(updated)
  }
}

/** Fire-and-forget usage counter, called from `after()` — never awaited in render. */
export function touchGuestManagerLinkUseCase(
  deps: Pick<Deps, 'guestManagerLinksRepo'>
) {
  return async (raw: unknown) => {
    const parsed = GuestManagerTokenSchema.safeParse(raw)
    if (!parsed.success) return

    await deps.guestManagerLinksRepo.touch(parsed.data)
  }
}
