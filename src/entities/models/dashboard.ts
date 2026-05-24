import type { Gift } from './gift'
import type { Rsvp } from './rsvp'

export type ReservationStatus = 'pending' | 'reserved' | 'thanked'
export type RsvpStatus = 'pending' | 'confirmed' | 'declined'

export type DashboardStats = {
  totalGifts: number
  reservedGifts: number
  totalGiftValue: number
  totalReceived: number
  byStatus: Record<ReservationStatus, number>
  confirmedCount: number
  pendingCount: number
  declinedCount: number
  totalGuests: number
  messagesCount: number
  timeline: Array<{ date: string; count: number; amount: number }>
  recentActivity: Array<{
    id: string
    guestName: string
    type: 'Reserva' | 'Mensagem'
    detail: string
    status: ReservationStatus
    createdAt: string
  }>
}

export type GiftWithStatus = Gift & { status: ReservationStatus }
export type RsvpWithStatus = Rsvp & { status: RsvpStatus; guestsCount: number }
