import type { IGuestManagerLinksRepository } from '@/src/application/repositories/guest-manager-links.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  CreateGuestManagerLinkInputSchema,
  RevokeGuestManagerLinkInputSchema,
} from '@/src/entities/models/guest-manager-link'
import { z } from 'zod'

type Deps = {
  authService: IAuthService
  guestManagerLinksRepo: IGuestManagerLinksRepository
}

async function requireAdmin(deps: Pick<Deps, 'authService'>) {
  if (!(await deps.authService.getCurrentUser()))
    throw new UnauthenticatedError()
}

export function listGuestManagerLinksUseCase(deps: Deps) {
  return async () => {
    await requireAdmin(deps)
    return deps.guestManagerLinksRepo.list()
  }
}

/**
 * Unlike createInviteLinkUseCase, this does NOT revoke its predecessors: each
 * helper gets their own labelled link, so cutting off one person's access must
 * never silently cut off everyone else's.
 */
export function createGuestManagerLinkUseCase(deps: Deps) {
  return async (raw: unknown = {}) => {
    await requireAdmin(deps)

    const parsed = CreateGuestManagerLinkInputSchema.safeParse(raw ?? {})
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    return deps.guestManagerLinksRepo.create(parsed.data)
  }
}

export function revokeGuestManagerLinkUseCase(deps: Deps) {
  return async (raw: unknown) => {
    await requireAdmin(deps)

    const parsed = RevokeGuestManagerLinkInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const revoked = await deps.guestManagerLinksRepo.revoke(parsed.data.id)
    return { revoked }
  }
}

/** The panic button: kills every outstanding link at once. */
export function revokeAllGuestManagerLinksUseCase(deps: Deps) {
  return async () => {
    await requireAdmin(deps)

    const revoked = await deps.guestManagerLinksRepo.revokeAllActive()
    return { revoked }
  }
}
