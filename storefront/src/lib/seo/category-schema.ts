import { WithContext, CollectionPage, ItemList } from "schema-dts"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"

type CategoryData = {
  categories: HttpTypes.StoreProductCategory[]
  countryCode: string
  categoryUrl: string
}

/**
 * Generate CollectionPage JSON-LD schema for category pages
 * CollectionPage is appropriate for category/collection pages that list products
 */
export function generateCategorySchema(data: CategoryData): WithContext<CollectionPage> {
  const { categories, countryCode, categoryUrl } = data
  const baseUrl = getBaseURL()
  const mainCategory = categories[categories.length - 1] // Last category is the current one
  
  const schema: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: mainCategory.name || "",
    description: mainCategory.description || `${mainCategory.name} category`,
    url: categoryUrl.startsWith("http") ? categoryUrl : `${baseUrl}${categoryUrl}`,
  }

  return schema
}

/**
 * Generate ItemList JSON-LD schema for category pages
 * Alternative to CollectionPage - represents a list of products
 */
export function generateCategoryItemListSchema(
  data: CategoryData & { products?: Array<{ name: string; url: string }> }
): WithContext<ItemList> {
  const { categories, categoryUrl, products } = data
  const baseUrl = getBaseURL()
  const mainCategory = categories[categories.length - 1]

  const schema: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: mainCategory.name || "",
    description: mainCategory.description || `${mainCategory.name} category`,
    url: categoryUrl.startsWith("http") ? categoryUrl : `${baseUrl}${categoryUrl}`,
  }

  // Add items if products are provided
  if (products && products.length > 0) {
    schema.numberOfItems = products.length
    schema.itemListElement = products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: product.url,
    }))
  }

  return schema
}


