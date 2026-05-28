import type { Guest } from '@/src/entities/models/guest'

export type GuestRowViewModel = {
  id: string
  fullName: string
  status: Guest['status']
  partyId: string
  inviteToken: string
  inviteUrl: string
  confirmedAt: string | null
}

export const toGuestRow = (g: Guest, baseUrl: string): GuestRowViewModel => ({
  id: g.id,
  fullName: `${g.firstName} ${g.lastName}`.trim(),
  status: g.status,
  partyId: g.partyId,
  inviteToken: g.inviteToken,
  inviteUrl: `${baseUrl}/invite/full?token=${g.inviteToken}`,
  confirmedAt: g.confirmedAt ? g.confirmedAt.toISOString() : null,
})
