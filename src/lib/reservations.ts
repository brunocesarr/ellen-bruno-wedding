'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReservationStatus = 'pending' | 'reserved' | 'thanked'

export async function listReservations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gift_reservations')
    .select('*, gift:gifts(name, image_url)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
) {
  const supabase = await createClient()
  const patch: Record<string, unknown> = { status }
  if (status === 'reserved') patch.reserved_at = new Date().toISOString()
  if (status === 'thanked') patch.thanked_at = new Date().toISOString()

  const { error } = await supabase
    .from('gift_reservations')
    .update(patch)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin')
}
