import type { Guest, GuestStatus } from '@/src/entities/models/guest'

export type NonEmptyArray<T> = readonly [T, ...T[]]
export type StatusFilter = 'all' | GuestStatus
export type Party = { partyId: string; members: NonEmptyArray<Guest> }

/** Callbacks threaded from the GuestsTable container down to the row/card views. */
export type GuestListCallbacks = {
  copiedToken: string | null
  onCopyInvite: (token: string) => void
  onRequestDelete: (guest: Guest) => void
  onSaved: (guest: Guest) => void
}

export const STATUS_PILL: Record<
  GuestStatus,
  'confirmed' | 'pending' | 'declined'
> = {
  going: 'confirmed',
  pending: 'pending',
  not_going: 'declined',
}

export const STATUS_LABEL: Record<GuestStatus, string> = {
  going: 'Confirmado',
  pending: 'Pendente',
  not_going: 'Não vai',
}

export const fullName = (g: Guest) => `${g.firstName} ${g.lastName}`.trim()

export const inviteUrlFor = (token: string) =>
  typeof window === 'undefined'
    ? `/invite?token=${token}`
    : `${window.location.origin}/invite?token=${token}`

/** Groups guests by party, sorting members and parties by creation time. */
export function groupByParty(guests: Guest[]): Party[] {
  const map = new Map<string, Guest[]>()
  for (const g of guests) {
    const list = map.get(g.partyId) ?? []
    list.push(g)
    map.set(g.partyId, list)
  }

  const parties: Party[] = []
  for (const [partyId, members] of map) {
    if (members.length === 0) continue
    const sorted = [...members].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    ) as unknown as NonEmptyArray<Guest>
    parties.push({ partyId, members: sorted })
  }

  return parties.sort(
    (a, b) =>
      a.members[0].createdAt.getTime() - b.members[0].createdAt.getTime()
  )
}

/** Keeps only members matching `status`; returns null when none remain. */
export function filterPartyMembers(
  party: Party,
  status: StatusFilter
): Party | null {
  if (status === 'all') return party
  const members = party.members.filter((m) => m.status === status)
  if (members.length === 0) return null
  return { ...party, members: members as unknown as NonEmptyArray<Guest> }
}

export const partyMatchesQuery = (party: Party, q: string) =>
  !q ||
  party.members.some((m) => fullName(m).toLowerCase().includes(q.toLowerCase()))
