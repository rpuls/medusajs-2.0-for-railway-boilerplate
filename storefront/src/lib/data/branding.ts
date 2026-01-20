import { sdk } from "@lib/config"
import { cache } from "react"

export type Logo = {
  url?: string
  alt?: string
  width?: number
  height?: number
}

export type Logos = {
  main?: Logo
  footer?: Logo
  favicon?: Logo
}

export type SocialLink = {
  platform: string
  url: string
}

export type ContactInfo = {
  email?: string
  phone?: string
  address?: string
}

export type CarouselSlide = {
  image_url?: string
  title?: string
  description?: string
  link_url?: string
  link_text?: string
  order?: number
}

export type SeoDefaults = {
  meta_description_template?: string
  default_og_image_url?: string
  site_tagline?: string
}

export type BrandingConfig = {
  id?: string
  site_title?: string | null
  copyright_text?: string | null
  logos?: Logos | null
  social_links?: SocialLink[] | null
  contact_info?: ContactInfo | null
  carousel_slides?: CarouselSlide[] | null
  seo_defaults?: SeoDefaults | null
}

export const getBrandingConfig = cache(async function (): Promise<BrandingConfig | null> {
  try {
    const response = await sdk.client.fetch<{ branding: BrandingConfig }>("/store/branding", {
      next: { tags: ["branding"] },
    })

    if (!response || !response.branding) {
      return null
    }

    return response.branding as BrandingConfig
  } catch (error) {
    console.error("Error fetching branding config:", error)
    return null
  }
})

