import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type {
  DashboardStats,
  GiftCategoryBreakdown,
  ReservationStatus,
} from '@/src/entities/models/dashboard'
import type { Gift, GiftCategory } from '@/src/entities/models/gift'

type Deps = {
  giftsRepo: IGiftsRepository
  rsvpRepo: IRsvpRepository
  pixRepo: IPixConfirmationsRepository
  guestsRepo: IGuestsRepository
  rsvpRequestsRepo: IRsvpRequestsRepository
  expensesRepo: IExpensesRepository
  authService: IAuthService
}

export function getDashboardStatsUseCase(d: Deps) {
  return async (): Promise<DashboardStats> => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const [gifts, rsvps, pixList, guests, rsvpRequests, expenses] =
      await Promise.all([
        d.giftsRepo.list(),
        d.rsvpRepo.list(),
        d.pixRepo.list(),
        d.guestsRepo.list(),
        d.rsvpRequestsRepo.list(),
        d.expensesRepo.list(),
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

    const byCategory = new Map<GiftCategory, GiftCategoryBreakdown>()
    for (const g of gifts) {
      const entry = byCategory.get(g.category) ?? {
        category: g.category,
        giftCount: 0,
        confirmedTotal: 0,
        pledgedTotal: 0,
      }
      entry.giftCount += 1
      entry.confirmedTotal += confirmedByGift.get(g.id) ?? 0
      entry.pledgedTotal += g.pledgedTotal
      byCategory.set(g.category, entry)
    }
    const giftsByCategory = Array.from(byCategory.values()).sort(
      (a, b) => b.confirmedTotal - a.confirmedTotal
    )

    const guestsSummary = {
      total: guests.length,
      going: guests.filter((g) => g.status === 'going').length,
      pending: guests.filter((g) => g.status === 'pending').length,
      notGoing: guests.filter((g) => g.status === 'not_going').length,
    }

    const requestsSummary = {
      total: rsvpRequests.length,
      pending: rsvpRequests.filter((r) => r.status === 'pending').length,
      approved: rsvpRequests.filter((r) => r.status === 'approved').length,
      rejected: rsvpRequests.filter((r) => r.status === 'rejected').length,
    }

    const totalExpenses = expenses.reduce((s, e) => s + e.totalAmount, 0)
    const totalExpensesPaid = expenses.reduce(
      (s, e) => s + e.installments.reduce((si, i) => si + i.paidAmount, 0),
      0
    )

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
      giftsByCategory,
      guestsSummary,
      requestsSummary,
      totalExpenses,
      totalExpensesPaid,
      netBalance: totalReceived - totalExpensesPaid,
    }
  }
}
