import type {
  RsvpStatus,
  RsvpWithStatus,
} from '@/src/entities/models/dashboard'

export type RsvpViewModel = {
  id: string
  guestName: string
  email: string | null
  phone: string | null
  guestsCount: number
  status: RsvpStatus
  message: string | null
  dietaryRestrictions: string | null
  respondedAt: string | null
}

export function toRsvpViewModel(r: RsvpWithStatus): RsvpViewModel {
  return {
    id: r.id,
    guestName: r.fullName,
    email: r.email,
    phone: r.phone,
    guestsCount: r.guestsCount,
    status: r.status,
    message: r.message,
    dietaryRestrictions: r.dietaryRestrictions,
    respondedAt: r.createdAt.toISOString(),
  }
}
