import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"

/**
 * Generate full product URL
 */
export function getProductUrl(handle: string, countryCode: string): string {
  const baseUrl = getBaseURL()
  return `${baseUrl}/${countryCode}/products/${handle}`
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string, countryCode: string): string {
  const baseUrl = getBaseURL()
  return `${baseUrl}/${countryCode}${path}`
}

/**
 * Check if product is in stock
 */
export function isProductInStock(product: HttpTypes.StoreProduct): boolean {
  if (!product.variants || product.variants.length === 0) {
    return false
  }

  return product.variants.some((variant: any) => {
    // If inventory is not managed, product is always available
    if (!variant.manage_inventory) {
      return true
    }
    // If backorders are allowed, product is available
    if (variant.allow_backorder) {
      return true
    }
    // If inventory is managed and quantity > 0, product is available
    if (variant.manage_inventory && (variant.inventory_quantity || 0) > 0) {
      return true
    }
    return false
  })
}

/**
 * Get product price for schema (lowest price)
 */
export function getProductPriceForSchema(
  product: HttpTypes.StoreProduct
): { price: number; currency: string } | null {
  const { cheapestPrice } = getProductPrice({ product })
  
  if (!cheapestPrice) {
    return null
  }

  return {
    price: cheapestPrice.calculated_price_number / 100, // Convert from cents
    currency: cheapestPrice.currency_code,
  }
}

/**
 * Get all product images (thumbnail + images array)
 */
export function getProductImages(product: HttpTypes.StoreProduct): string[] {
  const images: string[] = []
  
  if (product.thumbnail) {
    images.push(product.thumbnail)
  }
  
  if (product.images && product.images.length > 0) {
    product.images.forEach((img: any) => {
      if (img.url && !images.includes(img.url)) {
        images.push(img.url)
      }
    })
  }
  
  return images
}

/**
 * Get product SKU (from first variant)
 */
export function getProductSku(product: HttpTypes.StoreProduct): string | null {
  return product.variants?.[0]?.sku || null
}


