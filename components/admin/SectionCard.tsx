import type { ReactNode } from 'react'

export function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm md:p-7 ${className}`}
    >
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-stone-900 md:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-stone-500">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
