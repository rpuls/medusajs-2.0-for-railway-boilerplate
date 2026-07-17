const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

// Host that product media is served from, e.g. an S3-compatible bucket
// (Railway bucket, MinIO, R2, ...). Accepts a bare hostname or a full URL.
// NEXT_PUBLIC_MINIO_ENDPOINT is the legacy name.
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME || process.env.NEXT_PUBLIC_MINIO_ENDPOINT
const mediaHostHasScheme = mediaHost ? /^https?:\/\//.test(mediaHost) : false
const mediaUrl = mediaHost ? new URL(mediaHostHasScheme ? mediaHost : `https://${mediaHost}`) : null

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      ...(process.env.NEXT_PUBLIC_BASE_URL
        ? [{ // Note: needed to serve images from /public folder
            protocol: process.env.NEXT_PUBLIC_BASE_URL.startsWith("https") ? "https" : "http",
            hostname: process.env.NEXT_PUBLIC_BASE_URL.replace(/^https?:\/\//, ""),
          }]
        : []),
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        ? [{ // Note: only needed when using local-file for product media
            protocol: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.startsWith("https") ? "https" : "http",
            hostname: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/^https?:\/\//, ""),
          }]
        : []),
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
      ...(mediaUrl // Note: needed when using S3-compatible bucket storage for media (Railway bucket, MinIO, R2, ...)
        ? (mediaHostHasScheme ? [mediaUrl.protocol.replace(":", "")] : ["https", "http"]).map((protocol) => ({
            protocol,
            hostname: mediaUrl.hostname,
            ...(mediaUrl.port ? { port: mediaUrl.port } : {}),
          }))
        : []),
    ],
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000
  }
}

module.exports = nextConfig
