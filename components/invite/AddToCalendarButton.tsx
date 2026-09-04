'use client'

import { buildInviteIcs } from '@/src/lib/calendar-ics'
import { CalendarPlus } from 'lucide-react'
import { motion } from 'motion/react'

export function AddToCalendarButton() {
  function handleClick() {
    const blob = new Blob([buildInviteIcs()], {
      type: 'text/calendar;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'casamento-ellen-bruno.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-dusty-blue-dark transition-colors hover:text-dusty-blue"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
      Adicionar ao calendário
    </motion.button>
  )
}
