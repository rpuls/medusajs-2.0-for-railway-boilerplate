import { sdk } from '../config'

/**
 * Service for fetching content from Payload CMS
 */
export class ContentService {
  /**
   * Fetch a landing page by slug
   */
  static async getLandingPage(slug: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/landing-pages?where[slug][equals]=${slug}`)
      const data = await response.json()
      return data.docs[0] || null
    } catch (error) {
      console.error('Error fetching landing page:', error)
      return null
    }
  }

  /**
   * Fetch all landing pages
   */
  static async getAllLandingPages() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/landing-pages`)
      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.error('Error fetching landing pages:', error)
      return []
    }
  }

  /**
   * Fetch a blog post by slug
   */
  static async getBlogPost(slug: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts?where[slug][equals]=${slug}`)
      const data = await response.json()
      return data.docs[0] || null
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  }

  /**
   * Fetch all blog posts
   */
  static async getAllBlogPosts() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts`)
      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  /**
   * Fetch a seller profile by ID
   */
  static async getSellerProfile(id: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/sellers?where[storeId][equals]=${id}`)
      const data = await response.json()
      return data.docs[0] || null
    } catch (error) {
      console.error('Error fetching seller profile:', error)
      return null
    }
  }

  /**
   * Fetch products and enrich them with content from Payload
   */
  static async getEnrichedProducts(options: { limit?: number; categoryId?: string; tags?: string[] } = {}) {
    try {
      // Fetch products from Medusa
      const { products } = await sdk.products.list({
        limit: options.limit || 10,
        category_id: options.categoryId,
      })

      // Fetch additional content for these products from Payload
      // This could be reviews, additional images, etc.
      const productIds = products.map(product => product.id)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews?where[productId][in]=${productIds.join(',')}`
      )
      const reviewsData = await response.json()
      const reviews = reviewsData.docs || []

      // Combine the data
      return products.map(product => {
        const productReviews = reviews.filter(review => review.productId === product.id)
        return {
          ...product,
          reviews: productReviews,
        }
      })
    } catch (error) {
      console.error('Error fetching enriched products:', error)
      return []
    }
  }
}
