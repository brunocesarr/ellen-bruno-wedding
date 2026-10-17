import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import type { INotificationService } from '@/src/application/services/notification.service.interface'
import {
  buildOverdueExpensesAlert,
  type OverdueInstallmentItem,
} from '@/src/lib/notification-templates'

type Deps = {
  expensesRepo: IExpensesRepository
  notificationService: INotificationService
}

const MS_PER_DAY = 86_400_000

const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((Date.parse(toIso) - Date.parse(fromIso)) / MS_PER_DAY)

/**
 * Daily digest of installments whose due date has passed and that are not
 * fully paid (same rule as `isOverdue` in listExpensesUseCase). One message for
 * the whole run, never one per parcela, and nothing is sent when nothing is
 * overdue.
 *
 * Triggered by a scheduled job, not an admin session, so unlike the other
 * expense use cases it does not call authService — the route that invokes it
 * is guarded by CRON_SECRET. `today` is injected ("YYYY-MM-DD", already in the
 * couple's timezone) so the rule is testable and the caller owns the clock.
 *
 * Unlike the best-effort gift/RSVP alerts, a send failure is NOT swallowed:
 * this alert is the whole point of the job, so the error must surface and fail
 * the run.
 */
export function notifyOverdueExpensesUseCase(deps: Deps) {
  return async (today: string): Promise<{ overdueCount: number }> => {
    const expenses = await deps.expensesRepo.list()

    const items: OverdueInstallmentItem[] = []
    for (const expense of expenses) {
      const ordered = [...expense.installments].sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate)
      )
      ordered.forEach((installment, index) => {
        const remaining = installment.amount - installment.paidAmount
        if (remaining <= 1e-6 || installment.dueDate >= today) return
        items.push({
          description: expense.description,
          installmentNumber: index + 1,
          installmentCount: ordered.length,
          dueDate: installment.dueDate,
          daysLate: daysBetween(installment.dueDate, today),
          remaining,
        })
      })
    }

    if (items.length === 0) return { overdueCount: 0 }

    // Most overdue first.
    items.sort((a, b) => b.daysLate - a.daysLate)
    await deps.notificationService.send(buildOverdueExpensesAlert(items))

    return { overdueCount: items.length }
  }
}
