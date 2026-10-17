'use server'

import { HONEYPOT_FIELD } from '@/components/ui/Honeypot'
import { createRsvpController } from '@/src/interface-adapters/controllers/rsvp/create-rsvp.controller'
import { getBoolean, getOptionalString, getString } from '@/src/lib/form-data'
import { enforceRateLimit } from '@/src/lib/rate-limit'
import type { ActionResult } from '@/src/lib/server-action-result'
import { revalidatePath } from 'next/cache'

export type RsvpActionState = ActionResult<{ id: string; fullName: string }>

export async function submitRsvpAction(
  _prev: unknown,
  formData: FormData
): Promise<RsvpActionState> {
  if (getOptionalString(formData, HONEYPOT_FIELD)) {
    return {
      ok: true,
      data: { id: 'ignored', fullName: getString(formData, 'fullName') },
    }
  }
  const limited = await enforceRateLimit('rsvp', {
    max: 10,
    windowSeconds: 600,
  })
  if (limited) return limited

  const result = await createRsvpController({
    fullName: getString(formData, 'fullName'),
    email: getOptionalString(formData, 'email'),
    phone: getOptionalString(formData, 'phone'),
    attending: getBoolean(formData, 'attending'),
    companions: 0,
    dietaryRestrictions: getOptionalString(formData, 'dietaryRestrictions'),
    message: getOptionalString(formData, 'message'),
  })

  if (result.ok) revalidatePath('/rsvp')
  return result
}
