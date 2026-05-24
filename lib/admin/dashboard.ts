'use server'

import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import type { GiftStatus } from './gifts'

type GiftAggRow = {
  id: string
  name: string
  price: number | string | null
  is_reserved: boolean | null
  reserved_by_name: string | null
  reserved_message: string | null
  reserved_at: string | null
  created_at: string | null
  pix_confirmations:
    | { confirmed: boolean | null; amount: number | string | null }[]
    | null
}

type RsvpAggRow = {
  id: string
  attending: boolean | null
  companions: number | null
  created_at: string | null
}

export async function getDashboardStats() {
  const supabase = await createSupabaseServerClient()

  const [giftsRes, rsvpRes] = await Promise.all([
    supabase.from('gifts').select(`
       id, name, price, is_reserved,
       reserved_by_name, reserved_message, reserved_at, created_at,
       pix_confirmations(confirmed, amount)
     `),
    supabase.from('rsvp').select('id, attending, companions, created_at'),
  ])

  const gifts = (giftsRes.data ?? []) as unknown as GiftAggRow[]
  const rsvps = (rsvpRes.data ?? []) as RsvpAggRow[]

  // Derive gift status counts
  const statusOf = (g: GiftAggRow): GiftStatus => {
    if (!g.is_reserved) return 'pending'
    return g.pix_confirmations?.some((p) => p.confirmed)
      ? 'thanked'
      : 'reserved'
  }

  const byStatus = {
    pending: gifts.filter((g) => statusOf(g) === 'pending').length,
    reserved: gifts.filter((g) => statusOf(g) === 'reserved').length,
    thanked: gifts.filter((g) => statusOf(g) === 'thanked').length,
  }

  const totalReceived = gifts.reduce((sum, g) => {
    const confirmedAmount = (g.pix_confirmations ?? [])
      .filter((p) => p.confirmed)
      .reduce((s, p) => s + Number(p.amount ?? 0), 0)
    return sum + confirmedAmount
  }, 0)

  // 30-day timeline of reservations (based on gifts.reserved_at)
  const today = new Date()
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })

  const reservedGifts = gifts.filter((g) => g.is_reserved && g.reserved_at)
  const timeline = days.map((iso) => {
    const dayItems = reservedGifts.filter(
      (g) => g.reserved_at?.slice(0, 10) === iso
    )
    return {
      date: `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
      count: dayItems.length,
      amount: dayItems.reduce((s, g) => s + Number(g.price ?? 0), 0),
    }
  })

  // Recent activity from reserved gifts (newest first)
  const recentActivity = [...gifts]
    .filter((g) => g.is_reserved)
    .sort((a, b) => (b.reserved_at ?? '').localeCompare(a.reserved_at ?? ''))
    .slice(0, 8)
    .map((g) => ({
      id: g.id,
      guestName: g.reserved_by_name ?? '—',
      type: g.reserved_message ? 'Mensagem' : 'Reserva',
      detail: g.name,
      status: statusOf(g),
      createdAt: g.reserved_at ?? g.created_at ?? new Date().toISOString(),
    }))

  return {
    // Gifts
    totalGifts: gifts.length,
    reservedGifts: gifts.filter((g) => g.is_reserved).length,
    totalGiftValue: gifts.reduce((s, g) => s + Number(g.price ?? 0), 0),
    totalReceived,
    byStatus,
    // RSVPs
    confirmedCount: rsvps.filter((r) => r.attending === true).length,
    pendingCount: rsvps.filter((r) => r.attending === null).length,
    declinedCount: rsvps.filter((r) => r.attending === false).length,
    totalGuests: rsvps
      .filter((r) => r.attending === true)
      .reduce((s, r) => s + 1 + (r.companions ?? 0), 0),
    // Deltas (placeholder — implement week-over-week if needed later)
    confirmedDelta: 0,
    receivedDelta: 0,
    // Lists
    messagesCount: gifts.filter((g) => !!g.reserved_message).length,
    timeline,
    recentActivity,
  }
}
