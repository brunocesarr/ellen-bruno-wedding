'use server'

import { getDashboardStatsController } from '@/src/interface-adapters/controllers/dashboard/get-stats.controller'

export async function getDashboardStatsAction() {
  return getDashboardStatsController()
}
