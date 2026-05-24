'use server'

import type { GiftStatus } from '@/lib/admin/gifts'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Move a gift between Kanban columns.
 *
 * Real schema has no `status` column, so we mutate the underlying booleans:
 *   - pending  → is_reserved = false, clear reserve fields
 *   - reserved → is_reserved = true (keep reserve fields)
 *   - thanked  → is_reserved = true + ensure a confirmed pix_confirmation exists
 */
export async function updateReservationStatus(
  giftId: string,
  status: GiftStatus
) {
  const supabase = await createSupabaseServerClient()

  if (status === 'pending') {
    const { error } = await supabase
      .from('gifts')
      .update({
        is_reserved: false,
        reserved_by_name: null,
        reserved_by_email: null,
        reserved_at: null,
        reserved_message: null,
      })
      .eq('id', giftId)
    if (error) throw error

    // Also remove any pix confirmations
    await supabase.from('pix_confirmations').delete().eq('gift_id', giftId)
  }

  if (status === 'reserved') {
    const { error } = await supabase
      .from('gifts')
      .update({
        is_reserved: true,
        reserved_at: new Date().toISOString(),
      })
      .eq('id', giftId)
    if (error) throw error

    // If there were confirmed pix rows, un-confirm them
    await supabase
      .from('pix_confirmations')
      .update({ confirmed: false })
      .eq('gift_id', giftId)
  }

  if (status === 'thanked') {
    await supabase.from('gifts').update({ is_reserved: true }).eq('id', giftId)

    const { data: existing } = await supabase
      .from('pix_confirmations')
      .select('id')
      .eq('gift_id', giftId)
      .limit(1)
      .maybeSingle()

    if (existing?.id) {
      await supabase
        .from('pix_confirmations')
        .update({ confirmed: true })
        .eq('id', existing.id)
    } else {
      const { data: gift } = await supabase
        .from('gifts')
        .select('price, reserved_by_name')
        .eq('id', giftId)
        .single()

      await supabase.from('pix_confirmations').insert({
        gift_id: giftId,
        guest_name: gift?.reserved_by_name ?? '—',
        amount: gift?.price ?? 0,
        confirmed: true,
      })
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/presentes')
  revalidatePath('/admin/mensagens')
  revalidatePath('/admin/resumo')
}
