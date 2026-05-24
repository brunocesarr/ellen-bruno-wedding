import Image from 'next/image'
import { type CSSProperties } from 'react'

type Props = {
  src: string
  alt: string
  caption?: string
  tilt?: 'left' | 'right'
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
  priority?: boolean
}

export function PolaroidPhoto({
  src,
  alt,
  caption,
  tilt = 'left',
  width = 200,
  height = 250,
  className = '',
  style,
  priority,
}: Props) {
  const tiltClass =
    tilt === 'left' ? 'polaroid-tilt-left' : 'polaroid-tilt-right'

  return (
    <figure className={`polaroid ${tiltClass} ${className}`} style={style}>
      <div
        className="relative overflow-hidden bg-cream-dark"
        style={{ width, height }}
      >
        <Image
          src={src}
          alt={alt}
          loading="eager"
          fill
          sizes={`${width}px`}
          className="object-cover"
          priority={priority}
        />
      </div>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-2 text-center font-display italic text-ink-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
