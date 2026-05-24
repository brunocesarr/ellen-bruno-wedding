'use server'

import { listRsvpController } from '@/src/interface-adapters/controllers/rsvp/list-rsvp.controller'

export async function listRsvpAction() {
  return listRsvpController()
}
