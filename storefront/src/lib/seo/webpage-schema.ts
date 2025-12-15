import { WithContext, WebPage } from "schema-dts"
import { getBaseURL } from "@lib/util/env"

type WebPageData = {
  name?: string
  description?: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
  publisher?: {
    name: string
    logo?: string
  }
}

/**
 * Generate WebPage JSON-LD schema
 * WebPage schema helps search engines understand individual pages
 */
export function generateWebPageSchema(
  data: WebPageData
): WithContext<WebPage> {
  const baseUrl = getBaseURL()
  
  const schema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.name || "",
    description: data.description,
    url: data.url.startsWith("http") ? data.url : `${baseUrl}${data.url}`,
  }

  // Add image if available
  if (data.image) {
    schema.image = data.image
  }

  // Add dates if available
  if (data.datePublished) {
    schema.datePublished = data.datePublished
  }
  if (data.dateModified) {
    schema.dateModified = data.dateModified
  }

  // Add author if available
  if (data.author) {
    schema.author = {
      "@type": "Person",
      name: data.author,
    }
  }

  // Add publisher if available
  if (data.publisher) {
    schema.publisher = {
      "@type": "Organization",
      name: data.publisher.name,
      ...(data.publisher.logo && {
        logo: {
          "@type": "ImageObject",
          url: data.publisher.logo,
        },
      }),
    }
  }

  return schema
}

