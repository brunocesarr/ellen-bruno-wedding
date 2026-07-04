/**
 * Centralized Tailwind recipes for repeated UI patterns. Compose with `cn()`
 * to append or override utilities at call sites.
 */

/** Primary pill action button (amber). */
export const buttonPrimary =
  'inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600'

/** Standard text/select/textarea field styling used across admin forms. */
export const inputField =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-stone-300 focus:border-amber-600'
