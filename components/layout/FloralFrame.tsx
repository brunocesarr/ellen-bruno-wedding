import Image from 'next/image'
import { cn } from '../../lib/utils'

interface FloralFrameProps {
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
  src: string
  className?: string
}

const positionStyles: Record<string, string> = {
  'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
  'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4 -scale-x-100',
  'bottom-left':
    'bottom-0 left-0 -translate-x-1/4 translate-y-1/4 -scale-y-100',
  'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4 rotate-180',
  top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-full md:w-full',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-full md:w-full',
  left: 'top-1/2 left-0 -translate-x-1/4 -translate-y-1/2',
  right: 'top-1/2 right-0 translate-x-1/4 -translate-y-1/2',
}

export function FloralFrame({ position, src, className }: FloralFrameProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-10 min-h-44 w-44 opacity-85 md:min-h-64 md:w-64',
        positionStyles[position],
        className
      )}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 176px, 224px"
        priority
        loading="eager"
      />
    </div>
  )
}
