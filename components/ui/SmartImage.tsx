'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

type Props = Omit<ImageProps, 'src' | 'alt' | 'onError'> & {
  src?: string | null
  fallback?: string | null
  alt?: string | null
}

function safeSrc(src?: string | null, fallback?: string | null) {
  return src && src.trim().length > 0
    ? src
    : fallback && fallback.trim().length > 0
      ? fallback
      : null
}

export function SmartImage({
  src,
  fallback,
  alt,
  fill,
  className,
  ...props
}: Props) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(() =>
    safeSrc(src, fallback)
  )
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setCurrentSrc(safeSrc(src, fallback))
    setErrored(false)
  }, [src, fallback])

  if (!currentSrc) {
    return (
      <div
        className={[
          fill ? 'absolute inset-0' : '',
          'grid place-items-center bg-stone-100 text-xs text-stone-400',
          className ?? '',
        ].join(' ')}
      >
        Sem imagem
      </div>
    )
  }

  return (
    <Image
      {...props}
      fill={fill}
      src={currentSrc}
      alt={alt ?? ''}
      loading="eager"
      className={className}
      onError={() => {
        const nextFallback = safeSrc(fallback, null)

        if (!errored && nextFallback && currentSrc !== nextFallback) {
          setErrored(true)
          setCurrentSrc(nextFallback)
        }
      }}
    />
  )
}
