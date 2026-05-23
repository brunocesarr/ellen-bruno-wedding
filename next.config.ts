import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.1.103'],
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 75, 85],
  },
}

export default nextConfig
