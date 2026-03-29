/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shake icon imports so each route ships less JS (faster nav + parse).
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig

