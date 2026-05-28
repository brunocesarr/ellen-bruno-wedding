'use client'

import { deleteGuestAction } from '@/app/admin/_actions/guests.actions'
import type { Guest } from '@/src/entities/models/guest'
import { useState, useTransition } from 'react'

type Options = {
  onSuccess?: (deletedId: string) => void
  onError?: (message: string) => void
}

export function useGuestDeletion({ onSuccess, onError }: Options = {}) {
  const [target, setTarget] = useState<Guest | null>(null)
  const [pending, startTransition] = useTransition()

  const request = (guest: Guest) => setTarget(guest)

  const cancel = () => {
    if (pending) return
    setTarget(null)
  }

  const confirm = () => {
    if (!target) return
    const id = target.id

    startTransition(async () => {
      const res = await deleteGuestAction(id)
      if (res.ok) {
        onSuccess?.(id)
        setTarget(null)
        return
      }
      onError?.(res.error)
    })
  }

  return {
    target,
    isOpen: target !== null,
    pending,
    request,
    cancel,
    confirm,
  }
}
