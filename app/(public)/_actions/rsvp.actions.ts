'use server'
import { createRsvpController } from '@/src/interface-adapters/controllers/rsvp/create-rsvp.controller'
import { revalidatePath } from 'next/cache'

export async function submitRsvpAction(_: unknown, formData: FormData) {
  const result = await createRsvpController({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    attending: formData.get('attending') === 'true',
    companions: formData.get('companions') ?? 0,
    dietaryRestrictions: formData.get('dietaryRestrictions'),
    message: formData.get('message'),
  })
  if (result.ok) revalidatePath('/rsvp')
  return result
}
