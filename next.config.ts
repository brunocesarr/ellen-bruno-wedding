import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true, // gzip/br on the Next server layer
  productionBrowserSourceMaps: false, // stop shipping/exposing source maps

  experimental: {
    // Tree-shakes the icon/motion/radix barrels -> smaller initial bundle
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
    optimizeCss: true, // critical-CSS inlining + CSS minification
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
    qualities: [70, 75, 80, 85],
  },

  // Long-cache immutable build assets at the framework layer too
  async headers() {
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
