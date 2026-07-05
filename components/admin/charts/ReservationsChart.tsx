'use client'

import { motion } from 'motion/react'

type Point = { date: string; count: number; amount: number }

export function ReservationsChart({ data }: { data: Point[] }) {
  if (!data.length)
    return (
      <p className="py-12 text-center text-sm text-stone-400">
        Sem dados ainda
      </p>
    )

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const width = 100
  const stepX = width / (data.length - 1 || 1)

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: 100 - (d.count / maxCount) * 80,
  }))

  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    ''
  )

  const dot = points[points.length - 1]
  if (!dot) return null

  const area = path + ` L ${dot.x} 100 L 0 100 Z`

  return (
    <div className="relative h-64 w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="resv-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8763e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a8763e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#resv-grad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="#a8763e"
          strokeWidth="0.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[10px] text-stone-400">
        {data
          .filter((_, i) => i % Math.ceil(data.length / 6) === 0)
          .map((d) => (
            <span key={d.date}>{d.date}</span>
          ))}
      </div>
    </div>
  )
}
