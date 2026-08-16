import { isGiftClosed, type GiftViewModel } from './gift.view-model'

export type PriceBand = 'entry' | 'mid' | 'premium' | 'flexible'

/**
 * Tunable. `nearGoalMax` drives the goal-gradient pull; `nameEvocative` is the
 * least evidenced weight here — set it to 0 to disable name sentiment entirely.
 */
const WEIGHTS = {
  bandMid: 14,
  bandFlexible: 12,
  bandPremium: 8,
  bandEntry: 6,
  nearGoalMax: 26,
  goalMet: -8,
  hasImage: 9,
  hasContributors: 7,
  nameEvocative: 6,
  nameTooLong: -4,
} as const

/**
 * Variety penalties must outweigh normal score gaps (roughly 6–50) so they
 * actually reorder, but they only apply when a constraint is already violated.
 */
const BAND_RUN_PENALTY = 40
const NAME_FAMILY_PENALTY = 30

/** Max consecutive cards sharing a price band before variety kicks in. */
const MAX_BAND_RUN = 2

/** How many preceding cards are checked for a repeated name family. */
const NAME_FAMILY_LOOKBACK = 2

/** How many leading cards must contain at least one flexible-amount gift. */
const FLEXIBLE_WITHIN = 4

/** Card titles clip beyond roughly this length in the grid. */
const NAME_LENGTH_LIMIT = 42

const NAME_STOPWORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'para',
  'pra',
  'e',
  'o',
  'a',
  'os',
  'as',
  'um',
  'uma',
  'no',
  'na',
  'em',
  'com',
  'que',
  'seu',
  'sua',
  'meu',
  'minha',
])

/**
 * Aspirational terms, already diacritic-free to match normalizeName output.
 * Deliberately short and pt-BR specific — this is the most speculative rule in
 * the file, so it is one editable array rather than buried logic.
 */
const EVOCATIVE_TERMS = [
  'lua de mel',
  'viagem',
  'viajar',
  'jantar',
  'passeio',
  'experiencia',
  'sonho',
  'aventura',
  'memoria',
  'momento',
  'historia',
  'futuro',
  'celebracao',
  'coracao',
  'brinde',
  'vinho',
  'spa',
  'hotel',
  'voo',
]

/** Accent-insensitive, punctuation-free comparison form. */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * First meaningful word, used to detect near-duplicate titles.
 * "Jogo de panelas" and "Jogo de toalhas" both yield "jogo", so they will not
 * be placed next to each other.
 */
export function nameFamily(name: string): string {
  const tokens = normalizeName(name)
    .split(' ')
    .filter((token) => token.length > 2 && !NAME_STOPWORDS.has(token))

  return tokens[0] ?? ''
}

function hasEvocativeName(name: string): boolean {
  const normalized = normalizeName(name)
  return EVOCATIVE_TERMS.some((term) => normalized.includes(term))
}

/**
 * pt-BR collation. `sensitivity: 'base'` keeps "Álbum" beside "Album" instead of
 * after "Zelador"; `numeric` orders "Jogo 2" before "Jogo 10".
 */
const NAME_COLLATOR = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
})

export function compareName(
  a: GiftViewModel,
  b: GiftViewModel,
  direction: 'asc' | 'desc'
): number {
  const result = NAME_COLLATOR.compare(a.name, b.name)
  return direction === 'asc' ? result : -result
}

/**
 * The figure a guest actually compares.
 *   fixed_item -> its price
 *   fund       -> money raised (a fund with R$1.200 is not worth 0)
 *   open_item  -> none; the guest decides
 */
export function sortableAmount(gift: GiftViewModel): number | null {
  if (gift.kind === 'fixed_item') return gift.price
  if (gift.kind === 'fund') return gift.confirmedTotal
  return null
}

/** Gifts with no comparable amount sort last in both directions. */
export function compareAmount(
  a: GiftViewModel,
  b: GiftViewModel,
  direction: 'asc' | 'desc'
): number {
  const left = sortableAmount(a)
  const right = sortableAmount(b)

  if (left === null && right === null) return 0
  if (left === null) return 1
  if (right === null) return -1

  return direction === 'asc' ? left - right : right - left
}

function quantile(sorted: number[], fraction: number): number {
  if (sorted.length === 0) return 0
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(fraction * (sorted.length - 1)))
  )
  return sorted[index] ?? 0
}

/**
 * Bands come from terciles of the fixed prices actually present, so the scale
 * adapts instead of relying on hardcoded BRL thresholds. Funds and open items
 * are always 'flexible' — the guest picks the amount, so they never compete
 * on price.
 */
export function computeBands(gifts: GiftViewModel[]): Map<string, PriceBand> {
  const prices = gifts
    .filter((gift) => gift.kind === 'fixed_item' && gift.price != null)
    .map((gift) => gift.price as number)
    .sort((a, b) => a - b)

  const bands = new Map<string, PriceBand>()

  if (prices.length === 0) {
    for (const gift of gifts) {
      bands.set(gift.id, gift.kind === 'fixed_item' ? 'mid' : 'flexible')
    }
    return bands
  }

  const lower = quantile(prices, 1 / 3)
  const upper = quantile(prices, 2 / 3)

  for (const gift of gifts) {
    if (gift.kind !== 'fixed_item' || gift.price == null) {
      bands.set(gift.id, 'flexible')
      continue
    }
    if (gift.price <= lower) bands.set(gift.id, 'entry')
    else if (gift.price <= upper) bands.set(gift.id, 'mid')
    else bands.set(gift.id, 'premium')
  }

  return bands
}

function scoreGift(gift: GiftViewModel, band: PriceBand): number {
  let score = 0

  if (band === 'mid') score += WEIGHTS.bandMid
  else if (band === 'flexible') score += WEIGHTS.bandFlexible
  else if (band === 'premium') score += WEIGHTS.bandPremium
  else score += WEIGHTS.bandEntry

  if (gift.kind === 'fund') {
    if (gift.progressPct == null) {
      // Open-ended fund: no goal, so no completion pull to exploit.
    } else if (gift.progressPct >= 100) {
      score += WEIGHTS.goalMet
    } else {
      // Superlinear: motivation climbs steeply as the goal comes into view.
      const ratio = Math.max(0, gift.progressPct) / 100
      score += WEIGHTS.nearGoalMax * Math.pow(ratio, 1.5)
    }

    if (gift.contributorCount > 0) score += WEIGHTS.hasContributors
  }

  if (gift.imageUrl) score += WEIGHTS.hasImage

  if (hasEvocativeName(gift.name)) score += WEIGHTS.nameEvocative
  if (gift.name.length > NAME_LENGTH_LIMIT) score += WEIGHTS.nameTooLong

  return score
}

type ScoredGift = { gift: GiftViewModel; score: number }

/**
 * Single greedy pass enforcing both variety dimensions at once: repeated price
 * band and repeated name family. Doing these as two separate passes made them
 * undo each other's work.
 *
 * Penalties are applied to the score rather than forcing a swap, so ordering
 * degrades gracefully when no alternative exists. O(n²), irrelevant at registry
 * sizes (dozens of items).
 */
function orderWithVariety(
  scored: ScoredGift[],
  bandOf: (gift: GiftViewModel) => PriceBand
): GiftViewModel[] {
  const pool = [...scored]
  const result: GiftViewModel[] = []

  let runBand: PriceBand | null = null
  let runLength = 0
  const recentFamilies: string[] = []

  while (pool.length > 0) {
    let bestIndex = 0
    let bestValue = -Infinity

    for (let i = 0; i < pool.length; i++) {
      const entry = pool[i]
      if (!entry) continue

      let value = entry.score

      const band = bandOf(entry.gift)
      if (runBand !== null && band === runBand && runLength >= MAX_BAND_RUN) {
        value -= BAND_RUN_PENALTY
      }

      const family = nameFamily(entry.gift.name)
      if (family && recentFamilies.includes(family)) {
        value -= NAME_FAMILY_PENALTY
      }

      // Strict `>` keeps the earliest candidate on ties, so ordering stays
      // deterministic and recency (input order) survives as the tiebreak.
      if (value > bestValue) {
        bestValue = value
        bestIndex = i
      }
    }

    const [picked] = pool.splice(bestIndex, 1)
    if (!picked) break

    const band = bandOf(picked.gift)
    if (band === runBand) runLength += 1
    else {
      runBand = band
      runLength = 1
    }

    const family = nameFamily(picked.gift.name)
    if (family) {
      recentFamilies.push(family)
      if (recentFamilies.length > NAME_FAMILY_LOOKBACK) recentFamilies.shift()
    }

    result.push(picked.gift)
  }

  return result
}

/**
 * Guarantees a guest sees at least one "you choose the amount" gift without
 * scrolling — the one card nobody can be priced out of.
 */
function ensureFlexibleEarly(
  ordered: GiftViewModel[],
  bandOf: (gift: GiftViewModel) => PriceBand
): GiftViewModel[] {
  const head = ordered.slice(0, FLEXIBLE_WITHIN)
  if (head.some((gift) => bandOf(gift) === 'flexible')) return ordered

  const index = ordered.findIndex((gift) => bandOf(gift) === 'flexible')
  if (index === -1 || index < FLEXIBLE_WITHIN) return ordered

  const next = [...ordered]
  const [flexible] = next.splice(index, 1)
  if (!flexible) return ordered

  next.splice(FLEXIBLE_WITHIN - 1, 0, flexible)
  return next
}

/**
 * Guest-facing default order. Availability is a hard partition; everything else
 * is a weighted score followed by a variety pass. Ties fall back to input order,
 * which is created_at desc from the repository — so recency is the tiebreak.
 */
export function rankGiftsForGuest(gifts: GiftViewModel[]): GiftViewModel[] {
  const bands = computeBands(gifts)
  const bandOf = (gift: GiftViewModel): PriceBand =>
    bands.get(gift.id) ?? 'flexible'

  const available = gifts.filter((gift) => !isGiftClosed(gift))
  const closed = gifts.filter((gift) => isGiftClosed(gift))

  const scored: ScoredGift[] = available
    .map((gift, index) => ({
      gift,
      index,
      score: scoreGift(gift, bandOf(gift)),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ gift, score }) => ({ gift, score }))

  return [
    ...ensureFlexibleEarly(orderWithVariety(scored, bandOf), bandOf),
    ...closed,
  ]
}
