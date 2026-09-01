import { createGiftCardPaymentUseCase } from '@/src/application/use-cases/gifts/create-gift-card-payment.use-case'
import { getContainer } from '@/src/di/container'
import {
  getCardPaymentService,
  isCardPaymentAvailable,
} from '@/src/infrastructure/services/get-card-payment-service'
import { handle } from '../_handle'

export async function createGiftCardPaymentController(input: unknown) {
  return handle(async () => {
    const { giftsRepo } = await getContainer()
    const cardPaymentService = getCardPaymentService()
    return createGiftCardPaymentUseCase({
      giftsRepo,
      cardPaymentService,
      isCardPaymentAvailable,
    })(input)
  })
}
