/**
 * Service for integrating Medusa and Payload CMS data
 */

import { getProductsById } from '@lib/data/products'
import * as PayloadAPI from './payload-api'

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

/**
 * Get products by seller ID
 */
export async function getProductsBySeller(sellerId: string, regionId: string) {
  try {
    const response = await fetch(
      `${MEDUSA_URL}/store/products?store_id=${sellerId}`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    const products = data.products || []
    
    // Get priced products
    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id)
      const pricedProducts = await getProductsById({
        ids: productIds,
        regionId,
      })
      
      return pricedProducts
    }
    
    return products
  } catch (error) {
    console.error('Error fetching seller products:', error)
    return []
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categorySlug: string, regionId: string) {
  try {
    // First get the category from Payload
    const category = await PayloadAPI.getCategoryBySlug(categorySlug)
    
    if (!category) {
      return []
    }
    
    // Then get products from Medusa with this category
    const response = await fetch(
      `${MEDUSA_URL}/store/products?category=${category.name}`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    const products = data.products || []
    
    // Get priced products
    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id)
      const pricedProducts = await getProductsById({
        ids: productIds,
        regionId,
      })
      
      return pricedProducts
    }
    
    return products
  } catch (error) {
    console.error('Error fetching category products:', error)
    return []
  }
}

/**
 * Get products by tag
 */
export async function getProductsByTag(tagSlug: string, regionId: string) {
  try {
    // First get the tag from Payload
    const tag = await PayloadAPI.getTagBySlug(tagSlug)
    
    if (!tag) {
      return []
    }
    
    // Then get products from Medusa with this tag
    const response = await fetch(
      `${MEDUSA_URL}/store/products?tags=${tag.name}`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    const products = data.products || []
    
    // Get priced products
    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id)
      const pricedProducts = await getProductsById({
        ids: productIds,
        regionId,
      })
      
      return pricedProducts
    }
    
    return products
  } catch (error) {
    console.error('Error fetching tag products:', error)
    return []
  }
}

/**
 * Enrich a Medusa product with Payload CMS data
 */
export async function enrichProductWithPayloadData(product: any) {
  if (!product) return null
  
  try {
    // Get seller information if available
    if (product.metadata?.sellerId) {
      const seller = await PayloadAPI.getSellerBySlug(product.metadata.sellerId)
      if (seller) {
        product.seller = seller
      }
    }
    
    // Get category information if available
    if (product.categories && product.categories.length > 0) {
      const categoryPromises = product.categories.map((category: any) => 
        PayloadAPI.getCategoryBySlug(category.handle)
      )
      
      const categories = await Promise.all(categoryPromises)
      product.enrichedCategories = categories.filter(Boolean)
    }
    
    return product
  } catch (error) {
    console.error('Error enriching product:', error)
    return product
  }
}
