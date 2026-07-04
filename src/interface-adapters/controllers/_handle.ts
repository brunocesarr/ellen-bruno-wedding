import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import type { ActionResult } from '@/src/lib/server-action-result'

/**
 * Runs a use-case and normalizes any thrown error into an {@link ActionResult}.
 * Domain errors surface their own message; `UnauthenticatedError` maps to the
 * stable `'unauthorized'` sentinel that Server Components check for redirects.
 */
export async function handle<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    if (e instanceof UnauthenticatedError)
      return { ok: false, error: 'unauthorized' }
    if (e instanceof ValidationError)
      return { ok: false, error: 'Dados inválidos', issues: e.issues }
    if (e instanceof Error) return { ok: false, error: e.message }
    return { ok: false, error: 'Erro inesperado' }
  }
}
