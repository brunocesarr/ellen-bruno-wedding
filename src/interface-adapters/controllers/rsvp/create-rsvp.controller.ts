import { createRsvpUseCase } from '@/src/application/use-cases/rsvp/create-rsvp.use-case'
import { getContainer } from '@/src/di/container'
import { ValidationError } from '@/src/entities/errors/common'

export async function createRsvpController(input: unknown) {
  const { rsvpRepo } = await getContainer()
  try {
    const rsvp = await createRsvpUseCase({ rsvpRepo })(input)
    return { ok: true as const, data: { id: rsvp.id, fullName: rsvp.fullName } }
  } catch (e) {
    if (e instanceof ValidationError)
      return { ok: false as const, error: 'Dados inválidos', issues: e.issues }
    return {
      ok: false as const,
      error: 'Erro inesperado ao confirmar presença',
    }
  }
}
