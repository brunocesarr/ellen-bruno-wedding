import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names and resolves conflicting Tailwind utilities
 * (e.g. `px-2` + `px-4` → `px-4`), so later classes win as expected.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}

/**
 * Formats a date string for display in Portuguese.
 */
export function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Generates days remaining until the wedding.
 */
export function daysUntilWedding(dateStr: string): number {
  const wedding = new Date(dateStr)
  const today = new Date()
  const diff = wedding.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Delays execution for a given number of milliseconds.
 * Useful for animation sequencing.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
