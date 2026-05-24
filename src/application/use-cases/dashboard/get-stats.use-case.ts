import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type {
  DashboardStats,
  ReservationStatus,
} from '@/src/entities/models/dashboard'

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

    // Confirmed pix amount per gift (excluding "free" pix where giftId is null)
    const confirmedByGift = new Map<string, number>()
    let untiedConfirmedAmount = 0 // 👈 Pix gifts not linked to any item

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

    const statusOf = (
      giftId: string,
      isReserved: boolean
    ): ReservationStatus => {
      if (!isReserved) return 'pending'
      return confirmedByGift.has(giftId) ? 'thanked' : 'reserved'
    }

    const byStatus: Record<ReservationStatus, number> = {
      pending: 0,
      reserved: 0,
      thanked: 0,
    }
    let totalReceived = untiedConfirmedAmount // 👈 include untied Pix
    let totalGiftValue = 0

    for (const g of gifts) {
      const s = statusOf(g.id, g.isReserved)
      byStatus[s] += 1
      totalGiftValue += g.price
      if (s === 'thanked') totalReceived += confirmedByGift.get(g.id) ?? 0
    }

    // 30-day timeline based on reservedAt
    const today = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const d2 = new Date(today)
      d2.setDate(today.getDate() - (29 - i))
      return d2.toISOString().slice(0, 10)
    })
    const timeline = days.map((iso) => {
      const dayItems = gifts.filter(
        (g) => g.reservedAt && g.reservedAt.toISOString().slice(0, 10) === iso
      )
      return {
        date: `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
        count: dayItems.length,
        amount: dayItems.reduce((s, g) => s + g.price, 0),
      }
    })

    const recentActivity = gifts
      .filter((g) => g.isReserved)
      .sort(
        (a, b) =>
          (b.reservedAt?.getTime() ?? 0) - (a.reservedAt?.getTime() ?? 0)
      )
      .slice(0, 8)
      .map((g) => ({
        id: g.id,
        guestName: g.reservedByName ?? '—',
        type: g.reservedMessage ? ('Mensagem' as const) : ('Reserva' as const),
        detail: g.name,
        status: statusOf(g.id, g.isReserved),
        createdAt: (g.reservedAt ?? new Date()).toISOString(),
      }))

    return {
      totalGifts: gifts.length,
      reservedGifts: gifts.filter((g) => g.isReserved).length,
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
