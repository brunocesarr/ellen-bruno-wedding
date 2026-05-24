'use server'

import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'

export type ConfirmationStatus = 'pending' | 'confirmed' | 'declined'

export type Confirmation = {
  id: string
  guestName: string
  email: string | null
  phone: string | null
  guestsCount: number
  status: ConfirmationStatus
  message: string | null
  dietaryRestrictions: string | null
  respondedAt: string | null
}

type RsvpRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  attending: boolean | null
  companions: number | null
  dietary_restrictions: string | null
  message: string | null
  created_at: string | null
}

function deriveStatus(attending: boolean | null): ConfirmationStatus {
  if (attending === true) return 'confirmed'
  if (attending === false) return 'declined'
  return 'pending'
}

export async function listConfirmations(): Promise<Confirmation[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('rsvp')
    .select(
      'id, full_name, email, phone, attending, companions, dietary_restrictions, message, created_at'
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as RsvpRow[]).map((d) => ({
    id: d.id,
    guestName: d.full_name,
    email: d.email,
    phone: d.phone,
    // companions = accompanying people; +1 to include the guest themself
    guestsCount: 1 + (d.companions ?? 0),
    status: deriveStatus(d.attending),
    message: d.message,
    dietaryRestrictions: d.dietary_restrictions,
    respondedAt: d.created_at,
  }))
}
