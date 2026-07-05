import type { ValidationIssues } from '@/src/entities/errors/common'
import { redirect } from 'next/navigation'

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: ValidationIssues }

export function unwrapForPage<T>(
  result: ActionResult<T>,
  loginPath = '/admin/login'
): T {
  if (result.ok) return result.data
  if (result.error === 'unauthorized') redirect(loginPath)
  throw new Error(result.error)
}
