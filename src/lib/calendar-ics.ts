import type { TimelineEvent } from '@/types'
import { WEDDING_DETAILS } from './constants'

// Contagem/MG never observes DST (Brazil abolished it nationwide in 2019), so
// a fixed América/São_Paulo UTC-3 offset is safe year-round without pulling
// in a timezone library just for one static event.
const BRAZIL_UTC_OFFSET_HOURS = 3

const toMinutes = (time: string): number => {
  const parts = time.split(':')
  return Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0)
}

const addDays = (dateStr: string, days: number): string => {
  const parts = dateStr.split('-').map(Number)
  const dt = new Date(
    Date.UTC(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  )
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

const toIcsUtc = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

const toIcsLocal = (dateStr: string, time: string): string => {
  const dateParts = dateStr.split('-').map(Number)
  const timeParts = time.split(':').map(Number)
  return toIcsUtc(
    new Date(
      Date.UTC(
        dateParts[0] ?? 0,
        (dateParts[1] ?? 1) - 1,
        dateParts[2] ?? 1,
        (timeParts[0] ?? 0) + BRAZIL_UTC_OFFSET_HOURS,
        timeParts[1] ?? 0
      )
    )
  )
}

// RFC 5545 §3.3.11 — backslash, semicolon, comma and newline are the only
// characters TEXT values must escape.
const escapeIcsText = (text: string): string =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')

// WEDDING_DETAILS.timeline is a non-empty hardcoded constant; the fallback
// values only exist to satisfy noUncheckedIndexedAccess, never to be hit.
const FALLBACK_EVENT: TimelineEvent = { time: '00:00', label: '' }
const firstOf = (events: TimelineEvent[]): TimelineEvent =>
  events[0] ?? FALLBACK_EVENT
const lastOf = (events: TimelineEvent[]): TimelineEvent =>
  events.at(-1) ?? FALLBACK_EVENT

export function buildInviteIcs(now: Date = new Date()): string {
  const { couple, date, location, timeline } = WEDDING_DETAILS
  const first = firstOf(timeline)
  const last = lastOf(timeline)

  const dtStart = toIcsLocal(date, first.time)
  // The timeline's last entry can land after midnight (e.g. "00:00
  // Encerramento") — if its clock time doesn't come after the start's, it
  // means the following calendar day.
  const endDate =
    toMinutes(last.time) <= toMinutes(first.time) ? addDays(date, 1) : date
  const dtEnd = toIcsLocal(endDate, last.time)

  const summary = `Casamento de ${couple.bride} & ${couple.groom}`
  const description = `Cerimônia e recepção do casamento de ${couple.bride} e ${couple.groom}.`
  const locationText = [location.venue, location.address, location.city]
    .filter(Boolean)
    .join(', ')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Casamento Ellen & Bruno//Convite//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:casamento-${couple.bride.toLowerCase()}-${couple.groom.toLowerCase()}-${date}@convite`,
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(locationText)}`,
    ...(location.mapUrl ? [`URL:${location.mapUrl}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n') + '\r\n'
}
