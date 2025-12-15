import { WithContext, Product } from "schema-dts"
import { HttpTypes } from "@medusajs/types"
import { getProductUrl, isProductInStock, getProductPriceForSchema, getProductImages, getProductSku } from "./utils"

type ProductSchemaData = {
  product: HttpTypes.StoreProduct
  countryCode: string
  brandName?: string | null
  categories?: Array<{ name: string; handle: string }>
}

/**
 * Generate Product JSON-LD schema
 */
export function generateProductSchema(data: ProductSchemaData): WithContext<Product> {
  const { product, countryCode, brandName, categories } = data
  
  const productUrl = getProductUrl(product.handle!, countryCode)
  const images = getProductImages(product)
  const priceData = getProductPriceForSchema(product)
  const sku = getProductSku(product)
  const inStock = isProductInStock(product)
  
  const schema: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title || "",
    description: product.description || product.title || "",
    image: images.length > 0 ? images : undefined,
    sku: sku || undefined,
    url: productUrl,
  }

  // Add brand if available
  if (brandName) {
    schema.brand = {
      "@type": "Brand",
      name: brandName,
    }
  }

  // Add category if available
  if (categories && categories.length > 0) {
    schema.category = categories.map((cat) => cat.name).join(", ")
  }

  // Add offer (price, availability)
  if (priceData) {
    schema.offers = {
      "@type": "Offer",
      price: priceData.price,
      priceCurrency: priceData.currency,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // Valid for 1 year
      itemCondition: "https://schema.org/NewCondition", // Add condition
    }
  }

  // Add product condition
  schema.itemCondition = "https://schema.org/NewCondition"

  return schema
}

