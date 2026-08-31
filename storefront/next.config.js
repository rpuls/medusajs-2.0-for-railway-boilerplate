const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

// Host that product media is served from, e.g. an S3-compatible bucket
// (Railway bucket, MinIO, R2, ...). Accepts a bare hostname or a full URL.
// NEXT_PUBLIC_MINIO_ENDPOINT is the legacy name.
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME || process.env.NEXT_PUBLIC_MINIO_ENDPOINT
const mediaHostHasScheme = mediaHost ? /^https?:\/\//.test(mediaHost) : false
const mediaUrl = mediaHost ? new URL(mediaHostHasScheme ? mediaHost : `https://${mediaHost}`) : null

/**
 * Turns a configured URL into a remotePattern.
 *
 * Stripping the scheme with a regex, which is what this file used to do, leaves
 * the port attached to the hostname. `http://localhost:9000` became
 * `hostname: "localhost:9000"`, which matches nothing: Next compares the
 * hostname alone and carries the port in its own field. Local development and
 * any self-hosted backend on a non-default port were silently unmatched.
 *
 * Returns an empty array rather than throwing, so a malformed env var cannot
 * take down a boot. This module is loaded by `next start` too, not just builds.
 */
const remotePattern = (value) => {
  if (!value) return []
  try {
    const url = new URL(/^https?:\/\//.test(value) ? value : `https://${value}`)
    return [{
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    }]
  } catch {
    console.warn(`next.config.js: ignoring unparseable image host "${value}"`)
    return []
  }
}

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
    // Thumbnails request quality 50. Next 16 requires every quality used to be
    // declared here, and warns about it from 15 onwards.
    qualities: [50, 75, 100],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Needed to serve images from the /public folder
      ...remotePattern(process.env.NEXT_PUBLIC_BASE_URL),
      // Only needed when the backend uses local-file storage for product media
      ...remotePattern(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
      { // Note: thumbnails for the setup-video cards in the example homepage
        // section. Can be removed along with src/modules/home/components/hero.
        protocol: "https",
        hostname: "img.youtube.com",
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
      ...(mediaUrl // Note: needed when using S3-compatible bucket storage for media (Railway bucket, MinIO, R2, ...)
        ? (mediaHostHasScheme ? [mediaUrl.protocol.replace(":", "")] : ["https", "http"]).map((protocol) => ({
            protocol,
            hostname: mediaUrl.hostname,
            ...(mediaUrl.port ? { port: mediaUrl.port } : {}),
          }))
        : []),
    ],
  },
}

module.exports = nextConfig
