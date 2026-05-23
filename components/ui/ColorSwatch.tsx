import { cn } from '../../lib/utils'
import type { DressCodeColor } from '../../types'

interface ColorSwatchProps {
  color: DressCodeColor
  size?: 'sm' | 'md' | 'lg'
}

export function ColorSwatch({ color, size = 'md' }: ColorSwatchProps) {
  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'rounded-full shadow-sm ring-1 ring-charcoal/5',
          'transition-transform duration-200 hover:scale-110',
          sizes[size]
        )}
        style={{ backgroundColor: color.hex }}
        role="img"
        aria-label={`Cor: ${color.name}`}
      />
      <span className="font-body text-[0.65rem] tracking-wide text-warm-gray">
        {color.name}
      </span>
    </div>
  )
}
