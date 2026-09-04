import type { Guest, GuestStatus } from '@/src/entities/models/guest'

export type NonEmptyArray<T> = readonly [T, ...T[]]
export type StatusFilter = 'all' | GuestStatus
export type Party = { partyId: string; members: NonEmptyArray<Guest> }

export type GuestListCallbacks = {
  allGuests: Guest[]
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

export const GUEST_SORT_KEYS = ['name', 'status', 'members'] as const
export type GuestSortKey = (typeof GUEST_SORT_KEYS)[number]

export const GUEST_SORT_LABEL: Record<GuestSortKey, string> = {
  name: 'Nome',
  status: 'Status',
  members: 'Nº de membros',
}

/** Confirmado → Pendente → Não vai, matching the counters above the list. */
const STATUS_RANK: Record<GuestStatus, number> = {
  going: 0,
  pending: 1,
  not_going: 2,
}

/**
 * A party has no status of its own, so both `name` and `status` are read from
 * `members[0]` — the member PartyCard renders as the group head.
 *
 * Note this is the DISPLAYED head, not necessarily the original one: when a
 * status filter is active, filterPartyMembers() may already have dropped the
 * real head. Keying off members[0] keeps the ordering consistent with the name
 * actually shown at the top of each card.
 */
const byName = (a: Party, b: Party) =>
  fullName(a.members[0]).localeCompare(fullName(b.members[0]), 'pt-BR', {
    sensitivity: 'base',
  })

const byStatus = (a: Party, b: Party) =>
  STATUS_RANK[a.members[0].status] - STATUS_RANK[b.members[0].status]

/** Largest groups first — the big households are the ones worth spotting. */
const bySize = (a: Party, b: Party) => b.members.length - a.members.length

/**
 * The selected key leads; the remaining two fall back in the canonical
 * name → status → members order.
 */
const SORT_CHAIN: Record<GuestSortKey, ((a: Party, b: Party) => number)[]> = {
  name: [byName, byStatus, bySize],
  status: [byStatus, byName, bySize],
  members: [bySize, byName, byStatus],
}

/** Pure: returns a new array, leaving `parties` untouched. */
export function sortParties(parties: Party[], sortBy: GuestSortKey): Party[] {
  const chain = SORT_CHAIN[sortBy]

  return [...parties].sort((a, b) => {
    for (const compare of chain) {
      const result = compare(a, b)
      if (result !== 0) return result
    }
    // Absolute determinism when every key ties, so React keys never reshuffle.
    return a.partyId.localeCompare(b.partyId)
  })
}

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
