import { WEDDING_DETAILS } from '@/lib/constants'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')?.slice(0, 40)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdf8f3, #e8d5b7)',
        fontFamily: 'serif',
        color: '#2d2419',
      }}
    >
      <p style={{ letterSpacing: '0.5em', fontSize: 24, color: '#7a6648' }}>
        SAVE THE DATE
      </p>
      <h1 style={{ fontSize: 120, fontStyle: 'italic', margin: '24px 0' }}>
        {WEDDING_DETAILS.couple.bride}{' '}
        <span style={{ color: '#a8763e' }}>&</span>{' '}
        {WEDDING_DETAILS.couple.groom}
      </h1>
      {name && (
        <p style={{ fontSize: 36 }}>
          Convidam <i>{name}</i>
        </p>
      )}
      <div
        style={{
          width: 160,
          height: 2,
          background: '#a8763e',
          margin: '32px 0',
        }}
      />
      <p style={{ fontSize: 48, letterSpacing: '0.3em' }}>
        {WEDDING_DETAILS.displayDate}
      </p>
      <p style={{ fontSize: 28, color: '#7a6648', marginTop: 12 }}>
        {}
        {WEDDING_DETAILS.location.city}
      </p>
    </div>,
    { width: 1200, height: 630 }
  )
}
