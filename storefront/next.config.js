/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
    ],
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000
  }
}

console.log("Environment variables in next.config.js:");
console.log("NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);
console.log("NEXT_PUBLIC_MEDUSA_BACKEND_URL:", process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL);
console.log("PORT:", process.env.PORT);

console.log("next.config.js", JSON.stringify(module.exports, null, 2))

module.exports = nextConfig
