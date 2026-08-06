import { redirect } from 'next/navigation'

/**
 * Query flag appended when a token could not be resolved. The landing page
 * shows a notice and then strips it via history.replaceState, which also
 * removes the dead-token entry from history and prevents a back-button loop.
 */
export const INVALID_INVITE_PARAM = 'convite'
export const INVALID_INVITE_VALUE = 'invalido'

export const INVALID_INVITE_REDIRECT = `/?${INVALID_INVITE_PARAM}=${INVALID_INVITE_VALUE}`

/**
 * Single exit point for every token-gated public page.
 *
 * Never returns — `redirect()` throws internally, so callers can use it as a
 * terminal statement without a `return`.
 *
 * IMPORTANT: must be called OUTSIDE a try/catch, or Next's internal
 * NEXT_REDIRECT error will be swallowed.
 */
export function redirectInvalidInvite(): never {
  redirect(INVALID_INVITE_REDIRECT)
}
