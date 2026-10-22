import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { downloadExpenseDocumentsController } from '@/src/interface-adapters/controllers/expenses/manage-expense-document.controller'
import { safeFileName, zipFiles } from '@/src/lib/zip'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/expenses/documents[?expenseId=…]
 * One zip with every contract/comprovante of that expense, or of all expenses
 * (one folder per expense) when no id is given. Admin-only: the files live in
 * a private bucket.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const raw = new URL(req.url).searchParams.get('expenseId')
  const expenseId = raw ? z.string().uuid().safeParse(raw) : null
  if (expenseId && !expenseId.success) {
    return NextResponse.json({ error: 'Despesa inválida' }, { status: 400 })
  }

  const result = await downloadExpenseDocumentsController(expenseId?.data)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }

  const zip = zipFiles(result.data.files)
  const filename = `documentos-${safeFileName(result.data.label)}.zip`

  // Header values must be ASCII; filename* carries the real (accented) name.
  const asciiFallback = filename.normalize('NFD').replace(/[^\x20-\x7e]/g, '')

  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
