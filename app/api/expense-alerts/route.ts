import { notifyOverdueExpensesUseCase } from '@/src/application/use-cases/expenses/notify-overdue-expenses.use-case'
import { SupabaseExpensesRepository } from '@/src/infrastructure/repositories/supabase-expenses.repository'
import { createNotificationService } from '@/src/infrastructure/services/telegram-notification.service'
import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Today's date as "YYYY-MM-DD" in the couple's timezone (not UTC). */
const todayInSaoPaulo = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date()
  )

/**
 * Daily overdue-expense alert. Called by netlify/functions/expense-overdue-alert.ts
 * on a schedule. Same Bearer CRON_SECRET guard as /api/keep-alive; dependencies
 * are built directly (route handlers sit outside getContainer()).
 *
 * Returns 500 on failure so the scheduled function logs it as failed.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const { overdueCount } = await notifyOverdueExpensesUseCase({
      expensesRepo: new SupabaseExpensesRepository(createSupabaseAdminClient()),
      notificationService: createNotificationService(),
    })(todayInSaoPaulo())

    return NextResponse.json({ ok: true, overdueCount })
  } catch (error) {
    console.error('[expense-alerts] failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
