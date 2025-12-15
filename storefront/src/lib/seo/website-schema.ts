import { WithContext, WebSite } from "schema-dts"
import { getBaseURL } from "@lib/util/env"

type WebsiteData = {
  name?: string
  url?: string
  description?: string
  potentialAction?: {
    target: string
    queryInput: string
  }
}

/**
 * Generate WebSite JSON-LD schema for homepage
 * WebSite schema helps search engines understand your site structure
 */
export function generateWebsiteSchema(
  data?: WebsiteData
): WithContext<WebSite> {
  const baseUrl = getBaseURL()
  const siteName = data?.name || "MS Store"
  const siteUrl = data?.url || baseUrl
  const description = data?.description || "A performant frontend ecommerce storefront."

  const schema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: description,
  }

  // Add search action if available (for Google search box)
  if (data?.potentialAction) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: data.potentialAction.target,
      },
      "query-input": data.potentialAction.queryInput,
    }
  }

  return schema
}


