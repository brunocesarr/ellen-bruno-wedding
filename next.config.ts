import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      'react-hook-form',
    ],
    serverActions: { bodySizeLimit: '5mb' },
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
    qualities: [70, 75, 80, 85],
  },

  async headers() {
    // Only in production. In dev, Turbopack rebuilds chunks on every edit while
    // keeping stable filenames; an `immutable` header makes the browser serve
    // the stale chunk, causing "module factory is not available" errors.
    if (process.env.NODE_ENV !== 'production') return []

    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
