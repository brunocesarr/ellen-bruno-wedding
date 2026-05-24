import { getDashboardStatsUseCase } from '@/src/application/use-cases/dashboard/get-stats.use-case'
import { getContainer } from '@/src/di/container'
import type { DashboardStats } from '@/src/entities/models/dashboard'
import { handle } from '../_handle'

export async function getDashboardStatsController(): Promise<
  { ok: true; data: DashboardStats } | { ok: false; error: string }
> {
  const c = await getContainer()
  return handle(() => getDashboardStatsUseCase(c)())
}
