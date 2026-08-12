/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/api-doc',
        permanent: true,
      },
      {
        source: '/api-docs',
        destination: '/api-doc',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

