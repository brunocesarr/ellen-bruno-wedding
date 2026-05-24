'use server'

import { createRsvpController } from '@/src/interface-adapters/controllers/rsvp/create-rsvp.controller'
import { revalidatePath } from 'next/cache'

export type RsvpActionState =
  | { ok: true; data: { id: string; fullName: string } }
  | {
      ok: false
      error: string
      issues?: { fieldErrors: Record<string, string[]> }
    }

export async function submitRsvpAction(
  _prev: unknown,
  formData: FormData
): Promise<RsvpActionState> {
  const result = await createRsvpController({
    fullName: formData.get('fullName'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    attending: formData.get('attending') === 'true',
    companions: 0,
    dietaryRestrictions: formData.get('dietaryRestrictions') || undefined,
    message: formData.get('message') || undefined,
  })

  if (result.ok) {
    revalidatePath('/rsvp')
    return { ok: true, data: result.data }
  }

  return {
    ok: false,
    error: result.error,
    issues: (result as any).issues,
  }
}
