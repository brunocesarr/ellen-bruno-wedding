'use client'

import { motion } from 'motion/react'

type Slice = {
  label: string
  value: number
  color: string
}

export function DonutChart({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0) || 1
  const radius = 42
  const circumference = 2 * Math.PI * radius

  const segments = data.map((slice, index) => {
    const previousValue = data
      .slice(0, index)
      .reduce((sum, previousSlice) => sum + previousSlice.value, 0)

    const length = (slice.value / total) * circumference
    const previousLength = (previousValue / total) * circumference

    return {
      ...slice,
      length,
      offset: circumference - previousLength,
    }
  })

  return (
    <div className="flex flex-col items-center gap-5 md:flex-row md:gap-7">
      <div className="relative h-40 w-40 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f5efe4"
            strokeWidth="14"
          />

          {segments.map((segment, index) => (
            <motion.circle
              key={segment.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="14"
              strokeDasharray={`${segment.length} ${circumference}`}
              strokeDashoffset={segment.offset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-serif text-2xl font-semibold text-stone-900">
              {total}
            </p>
            <p className="text-xs text-stone-500">total</p>
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-2 text-sm">
        {data.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2 text-stone-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              {slice.label}
            </span>

            <span className="font-medium tabular-nums text-stone-900">
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
