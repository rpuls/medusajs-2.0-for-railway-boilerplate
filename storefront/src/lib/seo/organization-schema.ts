import { WithContext, Organization } from "schema-dts"
import { getBaseURL } from "@lib/util/env"

type OrganizationData = {
  name?: string
  logo?: string
  url?: string
  contactPoint?: {
    telephone?: string
    email?: string
    contactType?: string
  }
  sameAs?: string[] // Social media profiles
}

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema(
  data?: OrganizationData
): WithContext<Organization> {
  const baseUrl = getBaseURL()
  const siteName = data?.name || "MS Store"
  const siteUrl = data?.url || baseUrl
  const logo = data?.logo || `${baseUrl}/logo.png`

  const schema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
  }

  // Add contact point if available
  if (data?.contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      telephone: data.contactPoint.telephone,
      email: data.contactPoint.email,
      contactType: data.contactPoint.contactType || "customer service",
    }
  }

  // Add social media profiles if available
  if (data?.sameAs && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs
  }

  return schema
}


