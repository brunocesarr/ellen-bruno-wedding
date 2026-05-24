import type { WeddingDetails } from '../types'

export const WEDDING_DETAILS: WeddingDetails = {
  couple: {
    bride: 'Ellen',
    groom: 'Bruno',
    initials: 'E.B',
  },
  date: '2026-10-24',
  displayDate: '24 de Outubro, 2026',
  time: '16:00',
  location: {
    venue: 'Sítio Sossego Events',
    city: 'Contagem, MG',
    address: 'R. Quatro, 38 - Chácara Novo Horizonte',
    mapUrl:
      'https://www.google.com/maps/place/Site+Sossego+Events/@-19.8484775,-44.0461564,17z/data=!3m1!4b1!4m6!3m5!1s0xa696b0aba81751:0x9407e22b19e9a4b9!8m2!3d-19.8484826!4d-44.0435815!16s%2Fg%2F11bzzyyrxs?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D',
  },
  timeline: [
    { time: '16:00', label: 'Recepção dos convidados' },
    { time: '16:30', label: 'Cerimônia' },
    { time: '17:30', label: 'Coquetel & Fotos' },
    { time: '19:00', label: 'Jantar' },
    { time: '21:00', label: 'Festa & Dança' },
    { time: '00:00', label: 'Encerramento' },
  ],
  dressCode: [
    { name: 'Terracotta', hex: 'var(--color-terracotta)' },
    { name: 'Terracotta Claro', hex: 'var(--color-terracotta-light)' },
    { name: 'Azul Sereno', hex: 'var(--color-ocean)' },
    { name: 'Azul Claro', hex: 'var(--color-ocean-light)' },
    { name: 'Sage', hex: 'var(--color-sage)' },
    { name: 'Creme', hex: 'var(--color-cream-dark)' },
  ],
}

export const SECTION_IDS = {
  hero: 'hero',
  monogram: 'monogram',
  invitation: 'invitation',
  location: 'location',
  timeline: 'timeline',
  dressCode: 'dress-code',
  rsvp: 'rsvp',
} as const
