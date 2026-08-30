import type { Gift, GiftCategory } from './gift'
import type { Rsvp } from './rsvp'

export type ReservationStatus = 'pending' | 'reserved' | 'thanked'
export type RsvpStatus = 'pending' | 'confirmed' | 'declined'

export type GiftCategoryBreakdown = {
  category: GiftCategory
  giftCount: number
  confirmedTotal: number
  pledgedTotal: number
}

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
  giftsByCategory: GiftCategoryBreakdown[]
  guestsSummary: {
    total: number
    going: number
    pending: number
    notGoing: number
  }
  requestsSummary: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  totalExpenses: number
  totalExpensesPaid: number
  netBalance: number
}

export type GiftWithStatus = Gift & { status: ReservationStatus }
export type RsvpWithStatus = Rsvp & { status: RsvpStatus; guestsCount: number }
