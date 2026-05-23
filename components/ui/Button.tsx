import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-terracotta text-ivory hover:bg-terracotta-dark active:scale-[0.97] shadow-soft',
    outline:
      'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-ivory',
    ghost: 'text-terracotta hover:bg-terracotta/5 active:bg-terracotta/10',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-button font-display font-medium',
        'tracking-wider uppercase transition-all duration-300 ease-out',
        'focus-visible:ring-2 focus-visible:ring-terracotta-light focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
