/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com'
      },
      {
        protocol: 'https',
        hostname: '*.ggpht.com'
      },
      {
        protocol: 'https',
        hostname: 'xgdpehqfqnmpwleifprj.supabase.co'
      }
    ]
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: '/',
        permanent: false,
      },
    ]
  }
}

module.exports = nextConfig
