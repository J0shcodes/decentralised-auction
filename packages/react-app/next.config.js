/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.pexels.com",
        port: ""
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false
    }
    return config
  },  
}

module.exports = nextConfig
