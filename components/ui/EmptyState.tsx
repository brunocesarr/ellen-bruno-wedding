import { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-700">
        {icon}
      </div>
      <h3 className="font-serif text-lg text-stone-800">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action}
    </div>
  )
}
