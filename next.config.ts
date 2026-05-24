import type { NextConfig } from 'next'

const supabaseHost = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
).hostname

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85],
  },
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
}

export default nextConfig
