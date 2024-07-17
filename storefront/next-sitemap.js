const excludedPaths = ["/checkout", "/account/*"]

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
  generateRobotsTxt: true,
  exclude: excludedPaths + ["/[sitemap]"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: excludedPaths,
      },
    ],
  },
}
