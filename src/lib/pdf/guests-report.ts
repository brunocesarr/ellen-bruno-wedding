import 'server-only'

import type { Guest, GuestStatus } from '@/src/entities/models/guest'
import { fullName, STATUS_LABEL } from '@/src/lib/guests'
import { renderReportPdf, type ReportColumn } from './report-document'

const columns: ReportColumn[] = [
  { header: '#', width: '8%' },
  { header: 'Nome', width: '92%' },
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
      heading: statusFilter ? undefined : STATUS_LABEL[status],
      rows: members.map((g, i) => [
        String(i + 1),
        g.isChild
          ? { text: `${fullName(g)} `, bold: '(criança, menos de 5 anos)' }
          : fullName(g),
      ]),
    }
  })

  const scope = statusFilter ? STATUS_LABEL[statusFilter] : 'Todos'

  return renderReportPdf({
    title: `Lista de convidados - ${scope} - ${new Date().toLocaleDateString('pt-BR')}`,
    columns,
    sections,
  })
}
