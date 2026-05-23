import type { NextConfig } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : ''

const config: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85],
  },
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
}

export default config
