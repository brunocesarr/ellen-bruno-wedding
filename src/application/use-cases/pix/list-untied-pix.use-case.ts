import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { PixConfirmation } from '@/src/entities/models/pix'

type Deps = {
  pixRepo: IPixConfirmationsRepository
  authService: IAuthService
}

export function listUntiedPixUseCase(d: Deps) {
  return async (): Promise<PixConfirmation[]> => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    const all = await d.pixRepo.list()
    return all.filter((p) => p.giftId === null)
  }
}
