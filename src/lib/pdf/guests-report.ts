import 'server-only'

import type { Guest, GuestStatus } from '@/src/entities/models/guest'
import { fullName, STATUS_LABEL } from '@/src/lib/guests'
import { renderReportPdf, type ReportColumn } from './report-document'

const columns: ReportColumn[] = [
  { header: 'Nome', width: '60%' },
  { header: 'Observações', width: '40%' },
]

// Confirmado → Pendente → Não vai, matching the order used across the admin.
const STATUS_ORDER: GuestStatus[] = ['going', 'pending', 'not_going']

/**
 * `statusFilter` restricts the report to a single status (e.g. only
 * confirmed guests) instead of the usual three-section breakdown.
 */
export async function renderGuestsReportPdf(
  guests: Guest[],
  statusFilter?: GuestStatus
): Promise<Buffer> {
  const statuses = statusFilter ? [statusFilter] : STATUS_ORDER

  const sections = statuses.map((status) => {
    const members = guests
      .filter((g) => g.status === status)
      .sort((a, b) =>
        fullName(a).localeCompare(fullName(b), 'pt-BR', { sensitivity: 'base' })
      )

    return {
      heading: `${STATUS_LABEL[status]} (${members.length})`,
      rows: members.map((g) => [fullName(g), g.notes ?? '—']),
    }
  })

  const total = statusFilter
    ? guests.filter((g) => g.status === statusFilter).length
    : guests.length

  const scope = statusFilter
    ? `apenas "${STATUS_LABEL[statusFilter]}"`
    : 'agrupado por status'

  return renderReportPdf({
    title: 'Lista de convidados',
    subtitle: `Gerado em ${new Date().toLocaleDateString('pt-BR')} — ${scope}, ordenado por nome. Total: ${total} convidado(s).`,
    columns,
    sections,
  })
}
