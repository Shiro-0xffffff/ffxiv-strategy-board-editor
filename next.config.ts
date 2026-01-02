import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v2.xivapi.com',
        port: '',
        pathname: '/api/asset',
      },
    ],
  },
}

export default nextConfig
