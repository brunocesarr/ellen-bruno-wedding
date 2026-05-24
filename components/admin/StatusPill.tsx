const TONES = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  reserved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  thanked: 'bg-stone-100 text-stone-700 ring-1 ring-stone-200',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  declined: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
} as const

const LABEL: Record<keyof typeof TONES, string> = {
  pending: 'Pendente',
  reserved: 'Reservado',
  thanked: 'Agradecido',
  confirmed: 'Confirmado',
  declined: 'Recusado',
  paid: 'Pago',
  failed: 'Falhou',
}

export function StatusPill({ status }: { status: keyof typeof TONES }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[status]}
    </span>
  )
}
