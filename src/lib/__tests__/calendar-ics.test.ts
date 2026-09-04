import { describe, expect, it } from 'vitest'
import { buildInviteIcs } from '../calendar-ics'

describe('buildInviteIcs', () => {
  it('emits CRLF-terminated VCALENDAR/VEVENT blocks', () => {
    const ics = buildInviteIcs(new Date('2026-01-01T00:00:00Z'))
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('BEGIN:VEVENT\r\n')
    expect(ics).toContain('END:VEVENT\r\n')
  })

  it('converts the América/São_Paulo (UTC-3) timeline into UTC start/end', () => {
    // WEDDING_DETAILS timeline: 15:30 (first entry) → 00:00 "Encerramento"
    // (last entry), both on 2026-10-24 local time.
    const ics = buildInviteIcs(new Date('2026-01-01T00:00:00Z'))
    expect(ics).toContain('DTSTART:20261024T183000Z')
    // 00:00 local rolls into the next calendar day.
    expect(ics).toContain('DTEND:20261025T030000Z')
  })

  it('stamps DTSTAMP from the provided "now"', () => {
    const ics = buildInviteIcs(new Date('2026-03-15T12:34:56Z'))
    expect(ics).toContain('DTSTAMP:20260315T123456Z')
  })

  it('includes summary, location and map URL', () => {
    const ics = buildInviteIcs(new Date('2026-01-01T00:00:00Z'))
    expect(ics).toContain('SUMMARY:Casamento de Ellen & Bruno')
    expect(ics).toMatch(/LOCATION:.*Sítio Sossego Events/)
    expect(ics).toContain('URL:https://www.google.com/maps')
  })
})
