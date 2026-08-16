import { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type {
  GiftWithStatus,
  ReservationStatus,
} from '@/src/entities/models/dashboard'
import { GiftCategory, GiftKind } from '@/src/entities/models/gift'
import { resolveStorageUrl } from './_storage'

export type GiftViewModel = {
  id: string
  name: string
  description: string | null
  category: GiftCategory | null
  price: number | null // was `number` — null for open_item / fund
  imageUrl: string | null
  status: ReservationStatus
  reservedBy: string | null
  reservedByEmail: string | null
  reservedAt: string | null
  reservedMessage: string | null
  kind: GiftKind
  minAmount: number | null
  suggestedAmounts: number[]
  goalAmount: number | null
  confirmedTotal: number
  pledgedTotal: number
  contributorCount: number
  progressPct: number | null
  amountLabel: string
}

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Funds never lock. Use this instead of reading isReserved / status directly. */
export const isGiftClosed = (g: {
  kind: GiftKind
  status: ReservationStatus
}) => g.kind !== 'fund' && g.status !== 'pending'

export function toGiftViewModel(
  g: GiftWithStatus,
  storage: IStorageRepository
): GiftViewModel {
  // Guest-facing progress uses confirmedTotal only; pledged is admin-facing.
  const amountLabel =
    g.kind === 'fixed_item'
      ? g.price == null
        ? '—'
        : brl(g.price)
      : g.kind === 'open_item'
        ? 'Você escolhe o valor'
        : g.goalAmount
          ? `${brl(g.confirmedTotal)} de ${brl(g.goalAmount)}`
          : `${brl(g.confirmedTotal)} arrecadados`

  return {
    id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    price: g.price,
    imageUrl: resolveStorageUrl(g.imagePath, storage),
    status: g.status,
    reservedBy: g.reservedByName,
    reservedByEmail: g.reservedByEmail,
    reservedAt: g.reservedAt ? g.reservedAt.toISOString() : null,
    reservedMessage: g.reservedMessage,
    kind: g.kind,
    minAmount: g.minAmount,
    suggestedAmounts: g.suggestedAmounts,
    goalAmount: g.goalAmount,
    confirmedTotal: g.confirmedTotal,
    pledgedTotal: g.pledgedTotal,
    contributorCount: g.contributorCount,
    progressPct:
      g.kind === 'fund' && g.goalAmount
        ? Math.min(100, Math.round((g.confirmedTotal / g.goalAmount) * 100))
        : null,
    amountLabel,
  }
}
