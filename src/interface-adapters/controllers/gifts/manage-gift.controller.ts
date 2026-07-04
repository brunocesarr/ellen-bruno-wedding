import {
  createGiftUseCase,
  deleteGiftUseCase,
  updateGiftUseCase,
} from '@/src/application/use-cases/gifts/manage-gift.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

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
