import { cn } from '@/src/lib/utils'

export type CounterTone = 'neutral' | 'emerald' | 'amber' | 'rose'

const TONES: Record<CounterTone, string> = {
  neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export function Counter({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: CounterTone
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1',
        TONES[tone]
      )}
    >
      {label}
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
