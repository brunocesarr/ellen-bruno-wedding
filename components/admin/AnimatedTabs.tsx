'use client'

import { motion } from 'motion/react'
import { useId } from 'react'

type Tab<TId extends string> = {
  id: TId
  label: string
  count?: number
}

type Props<TId extends string> = {
  tabs: readonly Tab<TId>[]
  value: TId
  onChange: (id: TId) => void

  variant?: 'pills' | 'underline'
  ariaLabel?: string
}

export function AnimatedTabs<TId extends string>({
  tabs,
  value,
  onChange,
  variant = 'pills',
  ariaLabel = 'Tabs',
}: Props<TId>) {
  const layoutId = useId()

  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 border-b border-stone-200"
      >
        {tabs.map((tab) => {
          const active = tab.id === value
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'text-amber-800'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-amber-700"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-full bg-stone-100 p-1"
    >
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? 'text-amber-900' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {tab.label}
              {typeof tab.count === 'number' && (
                <span
                  className={`text-xs ${active ? 'text-amber-700' : 'text-stone-400'}`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
