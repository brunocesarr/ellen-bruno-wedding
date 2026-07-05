'use client'

import { useState } from 'react'

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
