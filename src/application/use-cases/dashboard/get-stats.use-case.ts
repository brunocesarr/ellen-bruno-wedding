import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type {
  DashboardStats,
  ReservationStatus,
} from '@/src/entities/models/dashboard'
import type { Gift } from '@/src/entities/models/gift'

type Deps = {
  giftsRepo: IGiftsRepository
  rsvpRepo: IRsvpRepository
  pixRepo: IPixConfirmationsRepository
  authService: IAuthService
}

export function getDashboardStatsUseCase(d: Deps) {
  return async (): Promise<DashboardStats> => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const [gifts, rsvps, pixList] = await Promise.all([
      d.giftsRepo.list(),
      d.rsvpRepo.list(),
      d.pixRepo.list(),
    ])

    const confirmedByGift = new Map<string, number>()
    let untiedConfirmedAmount = 0

    for (const p of pixList) {
      if (!p.confirmed) continue
      if (p.giftId) {
        confirmedByGift.set(
          p.giftId,
          (confirmedByGift.get(p.giftId) ?? 0) + p.amount
        )
      } else {
        untiedConfirmedAmount += p.amount
      }
    }

    // Mirrors listGiftsUseCase. Funds keep is_reserved = false forever, so
    // isReserved alone would pin every fund to 'pending' permanently.
    const statusOf = (g: Gift): ReservationStatus => {
      const hasMoney = confirmedByGift.has(g.id)
      if (g.kind === 'fund') return hasMoney ? 'thanked' : 'pending'
      if (!g.isReserved) return 'pending'
      return hasMoney ? 'thanked' : 'reserved'
    }

    /**
     * Target value per kind:
     *   fixed_item -> its price
     *   fund       -> its goal, when one was set (nothing to target otherwise)
     *   open_item  -> none; the buyer decides
     */
    const targetValueOf = (g: Gift): number => {
      if (g.kind === 'fixed_item') return g.price ?? 0
      if (g.kind === 'fund') return g.goalAmount ?? 0
      return 0
    }

    const byStatus: Record<ReservationStatus, number> = {
      pending: 0,
      reserved: 0,
      thanked: 0,
    }
    let totalReceived = untiedConfirmedAmount
    let totalGiftValue = 0

    for (const g of gifts) {
      const s = statusOf(g)
      byStatus[s] += 1
      totalGiftValue += targetValueOf(g)
      if (s === 'thanked') totalReceived += confirmedByGift.get(g.id) ?? 0
    }

    const today = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d2 = new Date(today)
      d2.setDate(today.getDate() - (29 - i))
      return d2.toISOString().slice(0, 10)
    })

    // Funds never set reservedAt, so a reservedAt-only timeline would omit every
    // fund contribution. The pix ledger is the one record that covers all kinds.
    const giftById = new Map(gifts.map((g) => [g.id, g]))

    const timeline = days.map((iso) => {
      const dayReservations = gifts.filter(
        (g) =>
          g.kind !== 'fund' &&
          g.reservedAt &&
          g.reservedAt.toISOString().slice(0, 10) === iso
      )

      const dayFundContributions = pixList.filter((p) => {
        if (!p.giftId) return false
        if (giftById.get(p.giftId)?.kind !== 'fund') return false
        return p.createdAt.toISOString().slice(0, 10) === iso
      })

      return {
        date: `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
        count: dayReservations.length + dayFundContributions.length,
        amount:
          dayReservations.reduce((s, g) => s + (g.price ?? 0), 0) +
          dayFundContributions.reduce((s, p) => s + p.amount, 0),
      }
    })

    const recentActivity = gifts
      .filter((g) =>
        g.kind === 'fund' ? g.contributorCount > 0 : g.isReserved
      )
      .sort(
        (a, b) =>
          (b.reservedAt?.getTime() ?? 0) - (a.reservedAt?.getTime() ?? 0)
      )
      .slice(0, 8)
      .map((g) => ({
        id: g.id,
        guestName:
          g.kind === 'fund'
            ? `${g.contributorCount} contribuinte(s)`
            : (g.reservedByName ?? '—'),
        type: g.reservedMessage ? ('Mensagem' as const) : ('Reserva' as const),
        detail: g.name,
        status: statusOf(g),
        createdAt: (g.reservedAt ?? new Date()).toISOString(),
      }))

    return {
      totalGifts: gifts.length,
      // Funds never lock, so they are never counted as reserved.
      reservedGifts: gifts.filter((g) => g.kind !== 'fund' && g.isReserved)
        .length,
      totalGiftValue,
      totalReceived,
      byStatus,
      confirmedCount: rsvps.filter((r) => r.attending === true).length,
      pendingCount: rsvps.filter((r) => r.attending === null).length,
      declinedCount: rsvps.filter((r) => r.attending === false).length,
      totalGuests: rsvps
        .filter((r) => r.attending === true)
        .reduce((s, r) => s + 1 + (r.companions ?? 0), 0),
      messagesCount: gifts.filter((g) => !!g.reservedMessage).length,
      timeline,
      recentActivity,
    }
  }
}
