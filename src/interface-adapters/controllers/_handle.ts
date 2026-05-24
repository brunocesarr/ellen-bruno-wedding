import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'

export async function handle<T>(fn: () => Promise<T>) {
  try {
    return { ok: true as const, data: await fn() }
  } catch (e) {
    if (e instanceof UnauthenticatedError)
      return { ok: false as const, error: 'unauthorized' }
    if (e instanceof ValidationError)
      return { ok: false as const, error: 'Dados inválidos', issues: e.issues }
    if (e instanceof Error) return { ok: false as const, error: e.message }
    return { ok: false as const, error: 'Erro inesperado' }
  }
}
