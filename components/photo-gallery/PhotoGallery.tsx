'use client'

import { PolaroidPhoto } from '@/components/gifts/PolaroidPhoto'
import { BrushStroke } from '@/components/ui/BrushStroke'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

export type GalleryPhoto = {
  src: string
  alt: string
  caption?: string
}

type Props = {
  photos?: GalleryPhoto[]
  eyebrow?: string
  title?: string
  accent?: string
}

const POSITIONS = [
  { left: '5%', top: '8%', rotate: -8, width: 200, height: 250, z: 10 },
  { left: '22%', top: '52%', rotate: 5, width: 180, height: 220, z: 20 },
  { left: '40%', top: '14%', rotate: -3, width: 240, height: 300, z: 30 },
  { left: '60%', top: '48%', rotate: 7, width: 200, height: 250, z: 20 },
  { left: '78%', top: '10%', rotate: -6, width: 190, height: 230, z: 10 },
  { left: '15%', top: '70%', rotate: 4, width: 160, height: 200, z: 5 },
  { left: '70%', top: '72%', rotate: -5, width: 170, height: 210, z: 5 },
]

export function PhotoGallery({
  photos = [],
  eyebrow = 'Nossa história',
  title = 'Momentos',
  accent = 'Cada foto, uma lembrança',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section className="relative overflow-hidden bg-white cream-grain py-20 md:py-28">
      <BrushStroke
        color="terracotta"
        className="absolute -left-4 top-1/2 hidden h-12 w-56 -translate-y-1/2 md:block"
      />
      <BrushStroke
        color="ocean"
        className="absolute -right-4 top-1/3 hidden h-10 w-40 md:block"
      />

      <SectionHeading eyebrow={eyebrow} title={title} accent={accent} />

      {/* Mobile: simple vertical scroll list */}
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6 px-6 md:hidden">
        {photos.slice(0, 6).map((photo, i) => (
          <PolaroidPhoto
            key={i}
            src={photo.src}
            alt={photo.alt}
            caption={photo.caption}
            tilt={i % 2 === 0 ? 'left' : 'right'}
            width={170}
            height={210}
          />
        ))}
      </div>

      {/* Desktop: scattered montage */}
      <div
        ref={ref}
        className="relative mx-auto hidden h-[680px] w-full max-w-6xl md:block"
      >
        {photos.slice(0, 7).map((photo, i) => (
          <ScatteredPhoto key={i} photo={photo} index={i} containerRef={ref} />
        ))}
      </div>
    </section>
  )
}

function ScatteredPhoto({
  photo,
  index,
  containerRef,
}: {
  photo: GalleryPhoto
  index: number
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const pos = POSITIONS[index % POSITIONS.length]

  if (!pos) return null

  // Parallax scroll: each photo moves at slightly different speed
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const yOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [50 * (index % 2 === 0 ? 1 : -1), -50 * (index % 2 === 0 ? 1 : -1)]
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: pos.rotate * 2 }}
      whileInView={{ opacity: 1, scale: 1, rotate: pos.rotate }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.2, 0.9, 0.3, 1],
      }}
      whileHover={{ scale: 1.05, rotate: pos.rotate / 2, zIndex: 50 }}
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top,
        zIndex: pos.z,
        y: yOffset,
      }}
    >
      <PolaroidPhoto
        src={photo.src}
        alt={photo.alt}
        caption={photo.caption}
        tilt={pos.rotate < 0 ? 'left' : 'right'}
        width={pos.width}
        height={pos.height}
      />
    </motion.div>
  )
}
