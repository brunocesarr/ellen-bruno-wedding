interface FlipCardProps {
  value: number
  label: string
  maxDigits?: number
}

export function FlipCard({ value, label, maxDigits = 2 }: FlipCardProps) {
  const displayValue = String(value).padStart(maxDigits, '0')

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-countdown-card shadow-lg sm:h-24 sm:w-24 md:h-28 md:w-28">
        <div className="absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-countdown-line" />

        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent" />

        <span className="relative top-1 z-0 font-typewriter text-4xl text-countdown-text sm:text-2xl md:text-4xl">
          {displayValue}
        </span>
      </div>

      <span className="font-body text-xs tracking-wider text-warm-gray sm:text-sm">
        {label}
      </span>
    </div>
  )
}
