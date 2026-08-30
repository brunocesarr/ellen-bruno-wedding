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

export async function renderGuestsReportPdf(guests: Guest[]): Promise<Buffer> {
  const sections = STATUS_ORDER.map((status) => {
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

  return renderReportPdf({
    title: 'Lista de convidados',
    subtitle: `Gerado em ${new Date().toLocaleDateString('pt-BR')} — agrupado por status, ordenado por nome. Total: ${guests.length} convidado(s).`,
    columns,
    sections,
  })
}
