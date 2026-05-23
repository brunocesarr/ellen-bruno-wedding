import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('gifts').select('id').limit(1)
  return NextResponse.json({ ok: !error, ts: new Date().toISOString() })
}
