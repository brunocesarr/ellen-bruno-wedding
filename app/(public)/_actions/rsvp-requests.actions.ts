'use server'

import { HONEYPOT_FIELD } from '@/components/ui/Honeypot'
import { submitRsvpRequestController } from '@/src/interface-adapters/controllers/rsvp-requests/submit-rsvp-request.controller'
import { enforceRateLimit } from '@/src/lib/rate-limit'
import { revalidateGroup } from '@/src/lib/revalidate'

type SubmitResult = Awaited<ReturnType<typeof submitRsvpRequestController>>

export async function submitRsvpRequestAction(
  input: unknown
): Promise<SubmitResult> {
  const { [HONEYPOT_FIELD]: trap, ...fields } = (input ?? {}) as Record<
    string,
    unknown
  >

  // A bot filled the hidden field: pretend it worked, store nothing.
  if (typeof trap === 'string' && trap.trim() !== '') {
    return {
      ok: true,
      data: {
        fullName: String(fields.fullName ?? ''),
        email: String(fields.email ?? ''),
      },
    } as SubmitResult
  }

  const limited = await enforceRateLimit('rsvp-request', {
    max: 5,
    windowSeconds: 600,
  })
  if (limited) return limited

  const res = await submitRsvpRequestController(fields)
  if (res.ok) revalidateGroup('rsvpRequests')
  return res
}
