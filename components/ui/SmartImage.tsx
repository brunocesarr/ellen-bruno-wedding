'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image, { type ImageProps } from 'next/image'
import { useEffect, useRef, useState } from 'react'

type Props = Omit<ImageProps, 'src' | 'alt' | 'onError'> & {
  src?: string | null
  fallback?: string | null
  alt?: string | null
}

function safeSrc(src?: string | null, fallback?: string | null) {
  if (src && src.trim().length > 0) return src
  if (fallback && fallback.trim().length > 0) return fallback
  return null
}

export function SmartImage({
  src,
  fallback,
  alt,
  fill,
  className,
  priority,
  sizes,
  ...props
}: Props) {
  const reduce = useReducedMotion()

  const [currentSrc, setCurrentSrc] = useState<string | null>(() =>
    safeSrc(src, fallback)
  )
  const [errored, setErrored] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    setCurrentSrc(safeSrc(src, fallback))
    setErrored(false)
    setIsLoading(true)
  }, [src, fallback])

  // If the image is already cached/complete before React attaches onLoad,
  // reveal it immediately so it doesn't stay stuck hidden.
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoading(false)
    }
  }, [currentSrc])

  if (!currentSrc) {
    return (
      <div
        className={[
          fill ? 'absolute inset-0' : '',
          'grid place-items-center bg-stone-100 text-xs text-stone-400',
          className ?? '',
        ].join(' ')}
        role="img"
        aria-label={alt ?? 'Imagem indisponível'}
      >
        Sem imagem
      </div>
    )
  }

  return (
    <div className={fill ? 'absolute inset-0' : 'relative'}>
      {/* Skeleton placeholder — crossfades out once the image is ready. */}
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key="skeleton"
            aria-hidden
            className="absolute inset-0 bg-stone-200"
            initial={{ opacity: reduce ? 1 : 0.6 }}
            animate={reduce ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    opacity: {
                      duration: 1.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
            }
          />
        ) : null}
      </AnimatePresence>

      {/* The image fades in smoothly when loaded. */}
      <motion.div
        className={fill ? 'absolute inset-0' : ''}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <Image
          {...props}
          ref={imgRef}
          fill={fill}
          src={currentSrc}
          alt={alt ?? ''}
          loading={priority ? undefined : 'lazy'}
          priority={priority}
          sizes={sizes ?? (fill ? '100vw' : undefined)}
          className={className}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            const nextFallback = safeSrc(fallback, null)
            if (!errored && nextFallback && currentSrc !== nextFallback) {
              setErrored(true)
              setCurrentSrc(nextFallback)
              setIsLoading(true)
              return
            }
            setIsLoading(false)
          }}
        />
      </motion.div>
    </div>
  )
}
