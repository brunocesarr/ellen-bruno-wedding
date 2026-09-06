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
    proxyClientMaxBodySize: '20mb',
    serverActions: { bodySizeLimit: '20mb' },
  },

  images: {
    // Fewer formats/sizes/qualities means fewer distinct transform variants,
    // each of which is a fresh full-size fetch of the original from Supabase
    // Storage the first time it's requested — trimmed to cut cached egress.
    formats: ['image/webp'],
    deviceSizes: [640, 1024, 1920],
    imageSizes: [64, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
    qualities: [75],
  },

  // Keep nodemailer out of the bundle; require it from node_modules at runtime.
  // pdfkit (used by @react-pdf/renderer) loads its AFM font metrics from disk
  // at runtime by relative path — bundling it rewrites those paths and breaks
  // font loading, so it needs the same treatment.
  serverExternalPackages: ['nodemailer', '@react-pdf/renderer', 'pdfkit'],

  async headers() {
    // Only in production. In dev, Turbopack rebuilds chunks on every edit while
    // keeping stable filenames; an `immutable` header makes the browser serve
    // the stale chunk, causing "module factory is not available" errors.
    if (process.env.NODE_ENV !== 'production') return []

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

export default nextConfig
