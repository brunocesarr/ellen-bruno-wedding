'use server'

import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

export type GuestMessage = {
  id: string
  guestName: string
  message: string
  thanked: boolean
  createdAt: string
  gift: { name: string; price: number | null; imageUrl: string | null } | null
}

type MessageRow = {
  id: string
  name: string
  price: number | string | null
  image_path: string | null
  reserved_by_name: string | null
  reserved_message: string | null
  reserved_at: string | null
  created_at: string | null
  pix_confirmations: { confirmed: boolean | null }[] | null
}

export async function listMessages(): Promise<GuestMessage[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gifts')
    .select(
      `
     id, name, price, image_path,
     reserved_by_name, reserved_message, reserved_at, created_at,
     pix_confirmations(confirmed)
   `
    )
    .not('reserved_message', 'is', null)
    .order('reserved_at', { ascending: false, nullsFirst: false })
  if (error) throw error

  return ((data ?? []) as unknown as MessageRow[])
    .filter((d) => !!d.reserved_message)
    .map((d) => ({
      id: d.id,
      guestName: d.reserved_by_name ?? 'Convidado(a)',
      message: d.reserved_message ?? '',
      thanked: d.pix_confirmations?.some((p) => p.confirmed) ?? false,
      createdAt: d.reserved_at ?? d.created_at ?? new Date().toISOString(),
      gift: {
        name: d.name,
        price: d.price !== null ? Number(d.price) : null,
        imageUrl: d.image_path,
      },
    }))
}

/**
 * "Mark as thanked" — since there's no `status` column, we model the
 * "thanked" state by ensuring a confirmed pix_confirmation exists for this gift.
 */
export async function markAsThanked(giftId: string) {
  const supabase = await createSupabaseServerClient()

  // Try to find existing pix row for this gift
  const { data: existing } = await supabase
    .from('pix_confirmations')
    .select('id')
    .eq('gift_id', giftId)
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('pix_confirmations')
      .update({ confirmed: true })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    // Create a synthetic confirmed entry (amount can be backfilled later)
    const { data: gift } = await supabase
      .from('gifts')
      .select('price, reserved_by_name')
      .eq('id', giftId)
      .single()

    const { error } = await supabase.from('pix_confirmations').insert({
      gift_id: giftId,
      guest_name: gift?.reserved_by_name ?? '—',
      amount: gift?.price ?? 0,
      confirmed: true,
    })
    if (error) throw error
  }

  revalidatePath('/admin/mensagens')
  revalidatePath('/admin')
  revalidatePath('/admin/resumo')
}
