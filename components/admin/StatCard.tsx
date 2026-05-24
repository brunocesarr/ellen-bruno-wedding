'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  label: string
  value: ReactNode
  hint?: string
  delta?: { value: number; label?: string }
  icon?: ReactNode
  accent?: 'amber' | 'rose' | 'emerald' | 'stone'
  index?: number
}

const ACCENT = {
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  stone: 'bg-stone-100 text-stone-700',
} as const

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon, // 👈 already a ReactNode now
  accent = 'amber',
  index = 0,
}: Props) {
  const positive = (delta?.value ?? 0) >= 0
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:shadow-md"
    >
      <header className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{label}</p>
        {icon && (
          <span
            className={`grid h-9 w-9 place-items-center rounded-full ${ACCENT[accent]}`}
          >
            {icon} {/* 👈 just render the node */}
          </span>
        )}
      </header>
      <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
        {value}
      </p>
      {(delta || hint) && (
        <footer className="mt-3 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                positive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {positive ? '+' : ''}
              {delta.value}%
            </span>
          )}
          {hint && <span className="text-stone-400">{hint}</span>}
        </footer>
      )}
    </motion.article>
  )
}
