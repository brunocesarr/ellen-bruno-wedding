import { listUntiedPixUseCase } from '@/src/application/use-cases/pix/list-untied-pix.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function listUntiedPixController() {
  const { pixRepo, authService } = await getContainer()
  return handle(() => listUntiedPixUseCase({ pixRepo, authService })())
}
