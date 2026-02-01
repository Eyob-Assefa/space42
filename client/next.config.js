/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Integrated Bypass Settings
  typescript: {
    // Allows production builds to complete even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows production builds to complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig