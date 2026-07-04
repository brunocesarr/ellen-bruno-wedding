import type { ValidationIssues } from '@/src/entities/errors/common'
import { redirect } from 'next/navigation'

/**
 * Canonical result shape returned by every controller and server action.
 * `issues` carries Zod field errors when `error === 'Dados inválidos'`.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: ValidationIssues }

/**
 * Unwraps an action result inside a Server Component:
 * redirects to the login page on `unauthorized`, throws on any other error
 * (surfacing to the nearest error boundary), otherwise returns the data.
 */
export function unwrapForPage<T>(
  result: ActionResult<T>,
  loginPath = '/admin/login'
): T {
  if (result.ok) return result.data
  if (result.error === 'unauthorized') redirect(loginPath)
  throw new Error(result.error)
}
