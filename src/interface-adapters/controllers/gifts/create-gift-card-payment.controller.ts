import { createGiftCardPaymentUseCase } from '@/src/application/use-cases/gifts/create-gift-card-payment.use-case'
import { getContainer } from '@/src/di/container'
import { MercadoPagoService } from '@/src/infrastructure/services/mercado-pago.service'
import { handle } from '../_handle'

export async function createGiftCardPaymentController(input: unknown) {
  return handle(async () => {
    const { giftsRepo } = await getContainer()
    // Constructed here, not in getContainer(): its constructor throws if
    // Mercado Pago isn't configured yet, and getContainer() is shared by
    // every controller/page — that would break unrelated requests.
    const cardPaymentService = new MercadoPagoService()
    return createGiftCardPaymentUseCase({ giftsRepo, cardPaymentService })(
      input
    )
  })
}
