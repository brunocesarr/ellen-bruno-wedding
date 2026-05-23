import { cn } from '../../lib/utils'

interface DividerProps {
  className?: string
  variant?: 'terracotta' | 'sage' | 'light'
}

export function Divider({ className, variant = 'terracotta' }: DividerProps) {
  const colors = {
    terracotta: 'text-terracotta/40',
    sage: 'text-sage/50',
    light: 'text-blush-rose/40',
  }

  const lineColors = {
    terracotta: 'bg-terracotta/15',
    sage: 'bg-sage/20',
    light: 'bg-blush-rose/20',
  }

  return (
    <div
      className={cn('my-10 flex items-center justify-center gap-4', className)}
      aria-hidden="true"
    >
      <span className={cn('h-px w-14', lineColors[variant])} />
      <svg
        className={cn('h-4 w-4', colors[variant])}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 11.5c0 .28-.22.5-.5.5h-7c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h7c.28 0 .5.22.5.5v1z" />
      </svg>
      <span className={cn('h-px w-14', lineColors[variant])} />
    </div>
  )
}
