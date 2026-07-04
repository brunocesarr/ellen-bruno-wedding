'use client'

import { useState } from 'react'

/**
 * Copy-to-clipboard with a transient "copied" flag keyed by the copied value,
 * so callers can highlight exactly which item was copied. Falls back to
 * `window.prompt` when the Clipboard API is unavailable.
 */
export function useCopyToClipboard(durationMs = 2000) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const copy = async (text: string, key: string = text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedValue(key)
      setTimeout(() => setCopiedValue(null), durationMs)
      return true
    } catch {
      window.prompt('Copie o link:', text)
      return false
    }
  }

  const isCopied = (value: string) => copiedValue === value

  return { copiedValue, isCopied, copy }
}
