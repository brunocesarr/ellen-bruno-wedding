import 'server-only'

import type { GiftCategoryBreakdown } from '@/src/entities/models/dashboard'
import { formatCurrencyBRL } from '@/src/lib/format'
import { GIFT_CATEGORY_LABELS } from '@/src/lib/gift-categories'
import { renderReportPdf, type ReportColumn } from './report-document'

const columns: ReportColumn[] = [
  { header: 'Categoria', width: '34%' },
  { header: 'Presentes', width: '22%', align: 'right' },
  { header: 'Recebido', width: '22%', align: 'right' },
  { header: 'Comprometido', width: '22%', align: 'right' },
]

export async function renderGiftsByCategoryReportPdf(
  breakdown: GiftCategoryBreakdown[]
): Promise<Buffer> {
  const rows = breakdown.map((b) => [
    GIFT_CATEGORY_LABELS[b.category],
    String(b.giftCount),
    formatCurrencyBRL(b.confirmedTotal),
    formatCurrencyBRL(b.pledgedTotal),
  ])

  const totals = breakdown.reduce(
    (acc, b) => ({
      giftCount: acc.giftCount + b.giftCount,
      confirmedTotal: acc.confirmedTotal + b.confirmedTotal,
      pledgedTotal: acc.pledgedTotal + b.pledgedTotal,
    }),
    { giftCount: 0, confirmedTotal: 0, pledgedTotal: 0 }
  )

  return renderReportPdf({
    title: 'Presentes por categoria',
    subtitle: `Gerado em ${new Date().toLocaleDateString('pt-BR')} — valores confirmados via Pix.`,
    columns,
    sections: [{ rows }],
    totalsRow: [
      'Total',
      String(totals.giftCount),
      formatCurrencyBRL(totals.confirmedTotal),
      formatCurrencyBRL(totals.pledgedTotal),
    ],
  })
}
