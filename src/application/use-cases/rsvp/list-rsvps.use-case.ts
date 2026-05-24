import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { RsvpWithStatus } from '@/src/entities/models/dashboard'

type Deps = {
  rsvpRepo: IRsvpRepository
  authService: IAuthService
}

export function listRsvpUseCase(d: Deps) {
  return async (): Promise<RsvpWithStatus[]> => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    const list = await d.rsvpRepo.list()
    return list.map((r) => ({
      ...r,
      guestsCount: 1 + (r.companions ?? 0),
      status:
        r.attending === true
          ? 'confirmed'
          : r.attending === false
            ? 'declined'
            : 'pending',
    }))
  }
}
