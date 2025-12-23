const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Headers for service worker and PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
  // Enable Cache Components (Next.js 16.0.7 - moved to root level per warning)
  cacheComponents: true,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@medusajs/js-sdk'],
    // Enable server actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Performance optimizations
  // Note: swcMinify is default in Next.js 16+, no need to specify
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Transpile MUI packages for proper Next.js compatibility
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material', '@mui/material-nextjs'],
  
  // Next.js 16 uses Turbopack by default. Since we have a webpack config for bundle optimization,
  // we need to either:
  // 1. Use Turbopack (add empty config below) - faster builds, but webpack optimizations won't apply
  // 2. Use webpack (remove turbopack config, use --webpack flag) - keeps bundle splitting
  // For now, using Turbopack to silence the error. To use webpack: next build --webpack
  turbopack: {},

  // Bundle optimization (only applies when using webpack with --webpack flag)
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for large libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // MedusaJS SDK chunk
            medusa: {
              name: 'medusa',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@medusajs[\\/]/,
              priority: 30,
            },
            // Payment providers chunk
            payments: {
              name: 'payments',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@stripe|@paypal)[\\/]/,
              priority: 25,
            },
            // Search chunk
            search: {
              name: 'search',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react-instantsearch|@meilisearch|algoliasearch)[\\/]/,
              priority: 25,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },

  images: {
    // Optimize images
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
    // Enable image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",

      },
      { // Note: needed to serve images from /public folder
        protocol: process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https') ? 'https' : 'http',
        hostname: process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, ''),
      },
      { // Note: only needed when using local-file for product media
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace('https://', ''),
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "bucket-production-a1ba.up.railway.app",
      },
      ...(process.env.NEXT_PUBLIC_MINIO_ENDPOINT ? [{ // Note: needed when using MinIO bucket storage for media
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
      }] : []),
    ],
  },
}

module.exports = nextConfig
