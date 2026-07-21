'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useState, type CSSProperties } from 'react'

type Props = {
  src: string
  alt: string
  fallback?: string
  caption?: string
  tilt?: 'left' | 'right'
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
  priority?: boolean
}

export function PolaroidPhoto(props: Props) {
  return (
    <PolaroidPhotoContent
      key={`${props.src}:${props.fallback ?? ''}`}
      {...props}
    />
  )
}

function PolaroidPhotoContent({
  src,
  alt,
  fallback,
  caption,
  tilt = 'left',
  width = 200,
  height = 250,
  className = '',
  style,
  priority,
}: Props) {
  const reduce = useReducedMotion()

  const tiltClass =
    tilt === 'left' ? 'polaroid-tilt-left' : 'polaroid-tilt-right'

  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [errored, setErrored] = useState(false)

  return (
    <figure className={`polaroid ${tiltClass} ${className}`} style={style}>
      <div
        className="relative overflow-hidden bg-cream-dark"
        style={{ width, height }}
      >
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

        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut' }}
        >
          <Image
            src={currentSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fill
            sizes={`${width}px`}
            className="object-cover"
            priority={priority}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              if (!errored && fallback && currentSrc !== fallback) {
                setErrored(true)
                setCurrentSrc(fallback)
                setIsLoading(true)
                return
              }

              setIsLoading(false)
            }}
          />
        </motion.div>
      </div>

      {caption && (
        <figcaption className="absolute inset-x-0 bottom-2 text-center font-display italic text-ink-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
