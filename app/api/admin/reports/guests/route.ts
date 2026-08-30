import { GUEST_STATUSES, type GuestStatus } from '@/src/entities/models/guest'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { listGuestsController } from '@/src/interface-adapters/controllers/guests/list-guests.controller'
import { renderGuestsReportPdf } from '@/src/lib/pdf/guests-report'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FILENAME_SLUG: Record<GuestStatus, string> = {
  going: 'confirmados',
  pending: 'pendentes',
  not_going: 'nao-vao',
}

function readStatusFilter(req: Request): GuestStatus | undefined {
  const raw = new URL(req.url).searchParams.get('status')
  return (GUEST_STATUSES as readonly string[]).includes(raw ?? '')
    ? (raw as GuestStatus)
    : undefined
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const statusFilter = readStatusFilter(req)

  const guests = await listGuestsController()
  if (!guests.ok) {
    return NextResponse.json({ error: guests.error }, { status: 400 })
  }

  const pdf = await renderGuestsReportPdf(guests.data, statusFilter)

  const filename = statusFilter
    ? `convidados-${FILENAME_SLUG[statusFilter]}.pdf`
    : 'convidados.pdf'

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
