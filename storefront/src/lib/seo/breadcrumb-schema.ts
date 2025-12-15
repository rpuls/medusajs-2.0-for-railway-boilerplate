import { WithContext, BreadcrumbList } from "schema-dts"
import { getBaseURL } from "@lib/util/env"

type BreadcrumbItem = {
  name: string
  url: string
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
  const baseUrl = getBaseURL()

  const schema: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return schema
}

/**
 * Generate product breadcrumb (Home > Category > Product)
 */
export function generateProductBreadcrumb(
  productName: string,
  productUrl: string,
  categoryName?: string,
  categoryUrl?: string,
  countryCode?: string
): WithContext<BreadcrumbList> {
  const baseUrl = getBaseURL()
  const items: BreadcrumbItem[] = [
    {
      name: "Home",
      url: countryCode ? `/${countryCode}` : "/",
    },
  ]

  if (categoryName && categoryUrl) {
    items.push({
      name: categoryName,
      url: countryCode ? `/${countryCode}${categoryUrl}` : categoryUrl,
    })
  }

  items.push({
    name: productName,
    url: productUrl,
  })

  return generateBreadcrumbSchema(items)
}

/**
 * Generate category breadcrumb (Home > Category > Subcategory)
 */
export function generateCategoryBreadcrumb(
  categories: Array<{ name: string; handle: string }>,
  countryCode?: string
): WithContext<BreadcrumbList> {
  const baseUrl = getBaseURL()
  const items: BreadcrumbItem[] = [
    {
      name: "Home",
      url: countryCode ? `/${countryCode}` : "/",
    },
  ]

  categories.forEach((category, index) => {
    items.push({
      name: category.name,
      url: countryCode
        ? `/${countryCode}/categories/${category.handle}`
        : `/categories/${category.handle}`,
    })
  })

  return generateBreadcrumbSchema(items)
}


