import { reserveGiftUseCase } from '@/src/application/use-cases/gifts/reserve-gift.use-case'
import { getContainer } from '@/src/di/container'
import { ValidationError } from '@/src/entities/errors/common'
import { GiftAlreadyReservedError } from '@/src/entities/errors/gifts'

export async function reserveGiftController(input: unknown) {
  const { giftsRepo } = await getContainer()
  try {
    const gift = await reserveGiftUseCase({ giftsRepo })(input)
    return { ok: true as const, data: { id: gift.id, name: gift.name } }
  } catch (e) {
    if (e instanceof GiftAlreadyReservedError)
      return { ok: false as const, error: e.message }
    if (e instanceof ValidationError)
      return { ok: false as const, error: 'Dados inválidos', issues: e.issues }
    return { ok: false as const, error: 'Erro inesperado' }
  }
}
