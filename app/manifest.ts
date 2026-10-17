import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ellen & Bruno — Wedding Day',
    short_name: 'Ellen & Bruno',
    description: 'Convite e informações do casamento de Ellen & Bruno.',
    start_url: '/',
    display: 'standalone',
    lang: 'pt-BR',
    background_color: '#faf7f2',
    theme_color: '#b97a57',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  }
}
