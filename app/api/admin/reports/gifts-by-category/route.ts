import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { getDashboardStatsController } from '@/src/interface-adapters/controllers/dashboard/get-stats.controller'
import { renderGiftsByCategoryReportPdf } from '@/src/lib/pdf/gifts-by-category-report'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const stats = await getDashboardStatsController()
  if (!stats.ok) {
    return NextResponse.json({ error: stats.error }, { status: 400 })
  }

  const pdf = await renderGiftsByCategoryReportPdf(stats.data.giftsByCategory)

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="presentes-por-categoria.pdf"',
    },
  })
}
