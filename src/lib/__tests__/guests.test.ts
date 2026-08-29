import type { Guest, GuestStatus } from '@/src/entities/models/guest'
import { describe, expect, it } from 'vitest'
import { sortParties, type NonEmptyArray, type Party } from '../guests'

let seq = 0
const guest = (
  firstName: string,
  lastName: string,
  status: GuestStatus = 'pending'
): Guest => {
  seq += 1
  return {
    id: `guest-${seq}`,
    firstName,
    lastName,
    status,
    inviteToken: `invite-${seq}`,
    partyInviteToken: `party-invite-${seq}`,
    partyId: `party-${seq}`,
    notes: null,
    confirmedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }
}

/** `head` drives the name/status keys; `extras` only pad the member count. */
const party = (partyId: string, head: Guest, extras: Guest[] = []): Party => ({
  partyId,
  members: [head, ...extras] as unknown as NonEmptyArray<Guest>,
})

const names = (parties: Party[]) =>
  parties.map((p) => `${p.members[0].firstName} ${p.members[0].lastName}`)

describe('sortParties — name', () => {
  it('orders groups by the displayed head guest, A–Z', () => {
    const input = [
      party('c', guest('Carla', 'Dias')),
      party('a', guest('Ana', 'Beatriz')),
      party('b', guest('Bruno', 'Carvalho')),
    ]

    expect(names(sortParties(input, 'name'))).toEqual([
      'Ana Beatriz',
      'Bruno Carvalho',
      'Carla Dias',
    ])
  })

  it('compares accents naturally rather than by code point', () => {
    // Naive < / > puts "Á" (U+00C1) after "B"; pt-BR collation does not.
    const input = [
      party('b', guest('Bruno', 'Carvalho')),
      party('a', guest('Álvaro', 'Dias')),
    ]

    expect(names(sortParties(input, 'name'))).toEqual([
      'Álvaro Dias',
      'Bruno Carvalho',
    ])
  })

  it('falls back to status, then size, when names are identical', () => {
    const input = [
      party('x', guest('Ana', 'Souza', 'not_going')),
      party('y', guest('Ana', 'Souza', 'going')),
      party('z', guest('Ana', 'Souza', 'pending')),
    ]

    expect(sortParties(input, 'name').map((p) => p.members[0].status)).toEqual([
      'going',
      'pending',
      'not_going',
    ])
  })
})

describe('sortParties — status', () => {
  it('orders Confirmado → Pendente → Não vai', () => {
    const input = [
      party('a', guest('Zeca', 'Lima', 'not_going')),
      party('b', guest('Bruno', 'Carvalho', 'pending')),
      party('c', guest('Carla', 'Dias', 'going')),
    ]

    expect(
      sortParties(input, 'status').map((p) => p.members[0].status)
    ).toEqual(['going', 'pending', 'not_going'])
  })

  it('breaks ties on name before size', () => {
    const input = [
      party('a', guest('Bruno', 'Carvalho', 'going'), [guest('X', 'Y')]),
      party('b', guest('Ana', 'Beatriz', 'going')),
    ]

    expect(names(sortParties(input, 'status'))).toEqual([
      'Ana Beatriz',
      'Bruno Carvalho',
    ])
  })
})

describe('sortParties — members', () => {
  it('puts the largest groups first', () => {
    const input = [
      party('a', guest('Ana', 'Beatriz')),
      party('b', guest('Bruno', 'Carvalho'), [
        guest('X', 'Y'),
        guest('W', 'Z'),
      ]),
      party('c', guest('Carla', 'Dias'), [guest('Q', 'R')]),
    ]

    expect(sortParties(input, 'members').map((p) => p.members.length)).toEqual([
      3, 2, 1,
    ])
  })
})

describe('sortParties — purity', () => {
  it('does not mutate the array it is given', () => {
    const input = [
      party('b', guest('Bruno', 'Carvalho')),
      party('a', guest('Ana', 'Beatriz')),
    ]
    const snapshot = [...input]

    sortParties(input, 'name')

    expect(input).toEqual(snapshot)
  })

  it('is deterministic when every sort key ties', () => {
    const build = () => [
      party('zzz', guest('Ana', 'Souza', 'going')),
      party('aaa', guest('Ana', 'Souza', 'going')),
    ]

    expect(sortParties(build(), 'name').map((p) => p.partyId)).toEqual([
      'aaa',
      'zzz',
    ])
    // Same input, same output — no dependence on incoming order.
    expect(
      sortParties(build().reverse(), 'name').map((p) => p.partyId)
    ).toEqual(['aaa', 'zzz'])
  })
})
