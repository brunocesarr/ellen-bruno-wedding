import { listRsvpUseCase } from '@/src/application/use-cases/rsvp/list-rsvps.use-case'
import { getContainer } from '@/src/di/container'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

export async function listRsvpsController() {
  const { rsvpRepo, authService } = await getContainer()
  try {
    const data = await listRsvpUseCase({ rsvpRepo, authService })()
    return { ok: true as const, data }
  } catch (e) {
    if (e instanceof UnauthenticatedError)
      return { ok: false as const, error: 'unauthorized' }
    return { ok: false as const, error: 'Erro ao buscar confirmações' }
  }
}
