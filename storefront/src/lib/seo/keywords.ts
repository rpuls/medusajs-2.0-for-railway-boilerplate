import { HttpTypes } from "@medusajs/types"

/**
 * Extract keywords from product data for SEO optimization
 * Keywords are naturally integrated into titles, descriptions, and content
 * rather than using deprecated meta keywords tag
 */
export function extractProductKeywords(product: HttpTypes.StoreProduct): string[] {
  const keywords: string[] = []

  // Add product title (main keyword)
  if (product.title) {
    keywords.push(product.title)
    // Also add individual words from title
    keywords.push(...product.title.toLowerCase().split(/\s+/))
  }

  // Add category names
  if (product.categories && product.categories.length > 0) {
    product.categories.forEach((category: any) => {
      if (category.name) {
        keywords.push(category.name)
      }
    })
  }

  // Add brand if available
  if ((product as any).metadata?._brand_name) {
    keywords.push((product as any).metadata._brand_name)
  }

  // Add tags if available
  if ((product as any).tags && Array.isArray((product as any).tags)) {
    (product as any).tags.forEach((tag: any) => {
      if (tag.value) {
        keywords.push(tag.value)
      }
    })
  }

  // Add collection names if available
  if ((product as any).collections && Array.isArray((product as any).collections)) {
    (product as any).collections.forEach((collection: any) => {
      if (collection.title) {
        keywords.push(collection.title)
      }
    })
  }

  // Remove duplicates and empty strings
  return [...new Set(keywords.filter(Boolean).map(k => k.toLowerCase()))]
}

/**
 * Generate keyword-rich description for products
 * Combines product description with category, brand, and other relevant keywords
 */
export function generateKeywordRichDescription(
  product: HttpTypes.StoreProduct,
  includeKeywords: boolean = true
): string {
  const parts: string[] = []

  // Start with product description if available
  if (product.description) {
    parts.push(product.description.trim())
  } else if (product.title) {
    parts.push(product.title)
  }

  // Add category context if available
  if (product.categories && product.categories.length > 0) {
    const categoryNames = product.categories
      .map((cat: any) => cat.name)
      .filter(Boolean)
      .join(", ")
    
    if (categoryNames && !parts[0]?.includes(categoryNames)) {
      parts.push(`Shop ${categoryNames} at MS Store.`)
    }
  }

  // Add brand context if available
  const brandName = (product as any).metadata?._brand_name
  if (brandName && !parts[0]?.includes(brandName)) {
    parts.push(`Authentic ${brandName} products.`)
  }

  // Add call-to-action
  if (parts.length > 0) {
    parts.push("Fast shipping and excellent customer service.")
  }

  return parts.join(" ").trim()
}

/**
 * Generate keyword-rich title for products
 * Includes product name, category, and brand when relevant
 */
export function generateKeywordRichTitle(
  product: HttpTypes.StoreProduct,
  siteName: string = "MS Store"
): string {
  const parts: string[] = []

  // Add product title
  if (product.title) {
    parts.push(product.title)
  }

  // Add category if it adds value (not redundant)
  if (product.categories && product.categories.length > 0) {
    const mainCategory = product.categories[0]
    if (mainCategory.name && !product.title?.toLowerCase().includes(mainCategory.name.toLowerCase())) {
      parts.push(mainCategory.name)
    }
  }

  // Add site name
  parts.push(siteName)

  return parts.join(" | ")
}

/**
 * Generate keyword-rich description for categories
 */
export function generateCategoryKeywordRichDescription(
  categoryName: string,
  categoryDescription?: string,
  productCount?: number
): string {
  const parts: string[] = []

  if (categoryDescription) {
    parts.push(categoryDescription.trim())
  } else {
    parts.push(`Shop ${categoryName} at MS Store.`)
  }

  if (productCount && productCount > 0) {
    parts.push(`Browse our collection of ${productCount}+ ${categoryName.toLowerCase()} products.`)
  }

  parts.push("Fast shipping and excellent customer service.")

  return parts.join(" ")
}


