'use server'

import type { RsvpRequestStatus } from '@/src/entities/models/rsvp-request'
import { clearRsvpRequestsHistoryController } from '@/src/interface-adapters/controllers/rsvp-requests/clear-rsvp-requests-history.controller'
import { countRsvpRequestAlertsController } from '@/src/interface-adapters/controllers/rsvp-requests/count-rsvp-request-alerts.controller'
import { decideRsvpRequestController } from '@/src/interface-adapters/controllers/rsvp-requests/decide-rsvp-request.controller'
import { deleteRsvpRequestController } from '@/src/interface-adapters/controllers/rsvp-requests/delete-rsvp-request.controller'
import { listRsvpRequestsController } from '@/src/interface-adapters/controllers/rsvp-requests/list-rsvp-requests.controller'
import { resendRsvpDecisionEmailController } from '@/src/interface-adapters/controllers/rsvp-requests/resend-rsvp-decision-email.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function listRsvpRequestsAction(status?: RsvpRequestStatus) {
  return listRsvpRequestsController({ status })
}

export async function countRsvpRequestAlertsAction() {
  return countRsvpRequestAlertsController()
}

export async function decideRsvpRequestAction(input: {
  id: string
  decision: 'approved' | 'rejected'
}) {
  const res = await decideRsvpRequestController(input)

  if (res.ok) {
    revalidateGroup('rsvpRequests')
    // Approval creates or updates a guest row, so guest views are stale too.
    if (res.data.request.status === 'approved') revalidateGroup('guests')
  }

  return res
}

export async function resendRsvpDecisionEmailAction(input: { id: string }) {
  const res = await resendRsvpDecisionEmailController(input)
  if (res.ok) revalidateGroup('rsvpRequests')
  return res
}

export async function deleteRsvpRequestAction(input: { id: string }) {
  const res = await deleteRsvpRequestController(input)
  // Only ever removes a pending row — no guest was touched.
  if (res.ok) revalidateGroup('rsvpRequests')
  return res
}

export async function clearRsvpRequestsHistoryAction() {
  const res = await clearRsvpRequestsHistoryController()
  if (res.ok) revalidateGroup('rsvpRequests')
  return res
}
