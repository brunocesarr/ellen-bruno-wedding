import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { listGuestsController } from '@/src/interface-adapters/controllers/guests/list-guests.controller'
import { renderGuestsReportPdf } from '@/src/lib/pdf/guests-report'
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

  const guests = await listGuestsController()
  if (!guests.ok) {
    return NextResponse.json({ error: guests.error }, { status: 400 })
  }

  const pdf = await renderGuestsReportPdf(guests.data)

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="convidados.pdf"',
    },
  })
}
