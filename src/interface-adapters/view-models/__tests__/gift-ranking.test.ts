import { describe, expect, it } from 'vitest'
import {
  compareName,
  computeBands,
  nameFamily,
  rankGiftsForGuest,
} from '../gift-ranking'
import type { GiftViewModel } from '../gift.view-model'

let counter = 0

const gift = (over: Partial<GiftViewModel>): GiftViewModel =>
  ({
    id: `g${++counter}`,
    name: 'Presente',
    description: null,
    category: 'other',
    price: 100,
    imageUrl: 'https://example.test/i.jpg',
    status: 'pending',
    reservedBy: null,
    reservedAt: null,
    reservedMessage: null,
    kind: 'fixed_item',
    minAmount: null,
    suggestedAmounts: [],
    goalAmount: null,
    confirmedTotal: 0,
    pledgedTotal: 0,
    contributorCount: 0,
    progressPct: null,
    amountLabel: 'R$ 100,00',
    ...over,
  }) as GiftViewModel

describe('nameFamily', () => {
  it('groups titles sharing a first meaningful word', () => {
    expect(nameFamily('Jogo de panelas')).toBe('jogo')
    expect(nameFamily('Jogo de toalhas')).toBe('jogo')
  })

  it('ignores accents and punctuation', () => {
    expect(nameFamily('Experiência à dois!')).toBe('experiencia')
  })

  it('skips stopwords', () => {
    expect(nameFamily('O que seu coração mandar...')).toBe('coracao')
  })

  it('returns an empty family for an unusable name', () => {
    expect(nameFamily('de a o')).toBe('')
  })
})

describe('compareName', () => {
  it('sorts accented names as their base letters', () => {
    const album = gift({ name: 'Álbum de fotos' })
    const zelador = gift({ name: 'Zelador' })
    expect(compareName(album, zelador, 'asc')).toBeLessThan(0)
  })

  it('orders embedded numbers naturally', () => {
    const two = gift({ name: 'Jogo 2' })
    const ten = gift({ name: 'Jogo 10' })
    expect(compareName(two, ten, 'asc')).toBeLessThan(0)
  })

  it('reverses for descending', () => {
    const a = gift({ name: 'Abajur' })
    const b = gift({ name: 'Batedeira' })
    expect(compareName(a, b, 'desc')).toBeGreaterThan(0)
  })
})

describe('computeBands', () => {
  it('splits fixed prices into terciles', () => {
    const cheap = gift({ price: 50 })
    const mid = gift({ price: 500 })
    const dear = gift({ price: 5000 })
    const bands = computeBands([cheap, mid, dear])

    expect(bands.get(cheap.id)).toBe('entry')
    expect(bands.get(mid.id)).toBe('mid')
    expect(bands.get(dear.id)).toBe('premium')
  })

  it('treats funds and open items as flexible', () => {
    const fund = gift({ kind: 'fund', price: null })
    const open = gift({ kind: 'open_item', price: null })
    const bands = computeBands([gift({ price: 100 }), fund, open])

    expect(bands.get(fund.id)).toBe('flexible')
    expect(bands.get(open.id)).toBe('flexible')
  })

  it('does not crash on a catalogue with no fixed prices', () => {
    const fund = gift({ kind: 'fund', price: null })
    expect(computeBands([fund]).get(fund.id)).toBe('flexible')
  })
})

describe('rankGiftsForGuest', () => {
  it('places closed gifts last', () => {
    const closed = gift({ status: 'reserved' })
    const open = gift({ status: 'pending' })
    expect(rankGiftsForGuest([closed, open]).at(-1)?.id).toBe(closed.id)
  })

  it('never treats a fund as closed', () => {
    const fund = gift({ kind: 'fund', price: null, status: 'thanked' })
    const reserved = gift({ status: 'reserved' })
    expect(rankGiftsForGuest([fund, reserved])[0]?.id).toBe(fund.id)
  })

  it('ranks an almost-complete fund above an empty one', () => {
    const nearly = gift({
      kind: 'fund',
      price: null,
      goalAmount: 1000,
      confirmedTotal: 850,
      progressPct: 85,
      contributorCount: 5,
    })
    const empty = gift({
      kind: 'fund',
      price: null,
      goalAmount: 1000,
      progressPct: 0,
    })
    expect(rankGiftsForGuest([empty, nearly])[0]?.id).toBe(nearly.id)
  })

  it('demotes a fund that has met its goal', () => {
    const met = gift({
      kind: 'fund',
      price: null,
      goalAmount: 1000,
      confirmedTotal: 1000,
      progressPct: 100,
    })
    const nearly = gift({
      kind: 'fund',
      price: null,
      goalAmount: 1000,
      confirmedTotal: 700,
      progressPct: 70,
    })
    expect(rankGiftsForGuest([met, nearly])[0]?.id).toBe(nearly.id)
  })

  it('never places two gifts of the same name family side by side', () => {
    const gifts = [
      gift({ name: 'Jogo de panelas', price: 500 }),
      gift({ name: 'Jogo de toalhas', price: 520 }),
      gift({ name: 'Jogo de lençóis', price: 540 }),
      gift({ name: 'Abajur', price: 60 }),
      gift({ name: 'Batedeira', price: 5000 }),
      gift({ name: 'Cafeteira', price: 5200 }),
    ]
    const ranked = rankGiftsForGuest(gifts)

    for (let i = 1; i < ranked.length; i++) {
      const previous = nameFamily(ranked[i - 1]!.name)
      const current = nameFamily(ranked[i]!.name)
      if (previous && current) expect(current).not.toBe(previous)
    }
  })

  it('avoids more than two consecutive gifts in the same price band', () => {
    const gifts = [
      gift({ name: 'Alfa', price: 5000 }),
      gift({ name: 'Bravo', price: 5200 }),
      gift({ name: 'Charlie', price: 5400 }),
      gift({ name: 'Delta', price: 5600 }),
      gift({ name: 'Echo', price: 60 }),
      gift({ name: 'Foxtrot', price: 500 }),
    ]
    const bands = computeBands(gifts)
    const ranked = rankGiftsForGuest(gifts)

    let run = 1
    for (let i = 1; i < ranked.length; i++) {
      const previous = bands.get(ranked[i - 1]!.id)
      const current = bands.get(ranked[i]!.id)
      run = current === previous ? run + 1 : 1
      expect(run).toBeLessThanOrEqual(2)
    }
  })

  it('surfaces a flexible gift within the first four cards', () => {
    const fixed = Array.from({ length: 8 }, (_, i) =>
      gift({ name: `Item ${i}`, price: 900 + i })
    )
    const fund = gift({
      name: 'Vaquinha',
      kind: 'fund',
      price: null,
      imageUrl: null,
      goalAmount: 5000,
      progressPct: 2,
    })
    const ranked = rankGiftsForGuest([...fixed, fund])

    expect(ranked.slice(0, 4).some((g) => g.kind === 'fund')).toBe(true)
  })

  it('boosts an evocative name over a utilitarian one at equal price', () => {
    const utilitarian = gift({ name: 'Jogo de toalhas', price: 500 })
    const evocative = gift({ name: 'Jantar romântico', price: 500 })
    expect(rankGiftsForGuest([utilitarian, evocative])[0]?.id).toBe(
      evocative.id
    )
  })

  it('penalises a name long enough to be truncated', () => {
    const short = gift({ name: 'Abajur', price: 500 })
    const long = gift({
      name: 'Conjunto completo de utensílios de cozinha em aço inoxidável',
      price: 500,
    })
    expect(rankGiftsForGuest([long, short])[0]?.id).toBe(short.id)
  })

  it('keeps input order as the tiebreak', () => {
    const first = gift({ name: 'Alfa', price: 500 })
    const second = gift({ name: 'Bravo', price: 500 })
    expect(rankGiftsForGuest([first, second]).map((g) => g.id)).toEqual([
      first.id,
      second.id,
    ])
  })
})
