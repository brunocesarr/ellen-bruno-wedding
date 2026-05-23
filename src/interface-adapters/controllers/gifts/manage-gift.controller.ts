import {
  createGiftUseCase,
  deleteGiftUseCase,
  updateGiftUseCase,
} from '@/src/application/use-cases/gifts/manage-gift.use-case'
import { getContainer } from '@/src/di/container'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'

const handle = async <T>(fn: () => Promise<T>) => {
  try {
    return { ok: true as const, data: await fn() }
  } catch (e) {
    if (e instanceof UnauthenticatedError)
      return { ok: false as const, error: 'unauthorized' }
    if (e instanceof ValidationError)
      return { ok: false as const, error: 'Dados inválidos', issues: e.issues }
    return { ok: false as const, error: 'Erro inesperado' }
  }
}

export async function createGiftController(input: unknown) {
  const c = await getContainer()
  return handle(() => createGiftUseCase(c)(input))
}
export async function updateGiftController(input: unknown) {
  const c = await getContainer()
  return handle(() => updateGiftUseCase(c)(input))
}
export async function deleteGiftController(id: string) {
  const c = await getContainer()
  return handle(() => deleteGiftUseCase(c)(id))
}
