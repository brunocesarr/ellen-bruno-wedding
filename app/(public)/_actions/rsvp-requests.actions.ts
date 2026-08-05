'use server'

import { submitRsvpRequestController } from '@/src/interface-adapters/controllers/rsvp-requests/submit-rsvp-request.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function submitRsvpRequestAction(input: unknown) {
  const res = await submitRsvpRequestController(input)
  if (res.ok) revalidateGroup('rsvpRequests')
  return res
}
