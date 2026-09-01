import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  GiftAlreadyReservedError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import { z } from 'zod'

type Deps = {
  giftsRepo: IGiftsRepository
  authService: IAuthService
}

const MarkGiftPaidInputSchema = z.object({
  id: z.string().uuid(),
  reservedByName: z.string().min(1, 'Informe quem pagou'),
})

/**
 * Manual reconciliation for gifts using an external payment_link: the guest
 * is redirected off-site and no webhook ever confirms the payment, so an
 * admin flips the gift to reserved once they've seen the payment land
 * elsewhere. Only meaningful for fixed_item — funds never lock and open_item
 * goes through the same admin-invisible flow as fixed_item, but only
 * fixed_item can carry a payment_link in the first place.
 */
export function markGiftPaidManuallyUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const result = MarkGiftPaidInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(z.flattenError(result.error))

    const gift = await d.giftsRepo.getById(result.data.id)
    if (!gift) throw new GiftNotFoundError()
    if (gift.kind !== 'fixed_item') {
      throw new ValidationError({
        formErrors: [
          'Só presentes de preço fixo podem ser marcados manualmente.',
        ],
        fieldErrors: {},
      })
    }
    if (gift.isReserved) throw new GiftAlreadyReservedError()

    return d.giftsRepo.markReservedManually(result.data)
  }
}
