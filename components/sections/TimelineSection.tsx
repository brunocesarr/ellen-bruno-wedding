'use client'

import { motion, useReducedMotion } from 'motion/react'

type TimelineItem = {
  time: string
  label: string
}

const ITEMS: TimelineItem[] = [
  { time: '16:00', label: 'Recepção dos convidados' },
  { time: '16:30', label: 'Cerimônia' },
  { time: '17:30', label: 'Coquetel & Fotos' },
  { time: '19:00', label: 'Jantar' },
  { time: '21:00', label: 'Festa & Dança' },
  { time: '00:00', label: 'Encerramento' },
]

export function TimelineSection() {
  const reduce = useReducedMotion()

  return (
    <section
      id="programacao"
      className="bg-[#f5efe4] py-20 md:py-28"
      aria-labelledby="programacao-title"
    >
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center md:mb-20"
        >
          <h2
            id="programacao-title"
            className="font-serif text-3xl font-bold uppercase tracking-[0.3em] text-amber-800 md:text-4xl"
          >
            Programação
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.4em] text-stone-500">
            O nosso dia
          </p>
        </motion.header>

        {/* Timeline */}
        <ol
          className="
          mx-auto grid max-w-xl
          grid-cols-[minmax(80px,1fr)_28px_minmax(0,1.4fr)]
          items-center
          gap-x-4 gap-y-10
          md:grid-cols-[minmax(120px,1fr)_28px_minmax(0,1.4fr)]
          md:gap-x-8 md:gap-y-14
        "
          role="list"
        >
          {ITEMS.map((item, i) => (
            <TimelineRow
              key={item.time}
              item={item}
              index={i}
              isFirst={i === 0}
              isLast={i === ITEMS.length - 1}
              reduce={!!reduce}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}

function TimelineRow({
  item,
  index,
  isFirst,
  isLast,
  reduce,
}: {
  item: TimelineItem
  index: number
  isFirst: boolean
  isLast: boolean
  reduce: boolean
}) {
  const transition = {
    duration: 0.55,
    delay: reduce ? 0 : index * 0.08,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <>
      {/* ── Column 1 · Time (right-aligned) ── */}
      <motion.span
        initial={{ opacity: 0, x: reduce ? 0 : -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={transition}
        className="
        justify-self-end
        font-serif text-3xl font-light leading-none tracking-wide text-amber-700
        md:text-4xl
      "
      >
        {item.time}
      </motion.span>

      {/* ── Column 2 · Spine + dot (centered, fixed width) ── */}
      <span
        aria-hidden="true"
        className="relative flex h-full min-h-[28px] w-full items-center justify-center"
      >
        {/* vertical line — trimmed at first/last so it doesn't poke out */}
        <span
          className={`
          absolute left-1/2 w-px -translate-x-1/2 bg-amber-700/40
          ${isFirst ? 'top-1/2' : 'top-0'}
          ${isLast ? 'bottom-1/2' : 'bottom-0'}
        `}
        />
        {/* dot — solid bg matches section bg to mask the line behind it */}
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ ...transition, delay: transition.delay + 0.1 }}
          className="
          relative z-10
          h-3 w-3 rounded-full
          border-2 border-amber-700 bg-[#f5efe4]
        "
        />
      </span>

      {/* ── Column 3 · Label (left-aligned) ── */}
      <motion.span
        initial={{ opacity: 0, x: reduce ? 0 : 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ ...transition, delay: transition.delay + 0.05 }}
        className="
        justify-self-start
        text-base text-stone-700
        md:text-lg
      "
      >
        {item.label}
      </motion.span>
    </>
  )
}
