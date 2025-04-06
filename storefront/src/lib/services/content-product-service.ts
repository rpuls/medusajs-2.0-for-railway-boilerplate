/**
 * Service for integrating Payload CMS content with Medusa.js products
 * This service helps bridge the gap between e-commerce data and content data
 */

import { medusaClient } from '@/lib/config';

interface EnrichedProduct extends Record<string, any> {
  id: string;
  title: string;
  description: string;
  // Medusa product fields
  handle: string;
  thumbnail: string | null;
  variants: any[];
  // Payload content fields
  content?: {
    longDescription?: string;
    features?: string[];
    videos?: { url: string; title: string }[];
    screenshots?: { url: string; alt: string }[];
    requirements?: string;
    documentation?: string;
    changelog?: { version: string; date: string; changes: string[] }[];
  };
  reviews?: any[];
  seller?: any;
}

export class ContentProductService {
  /**
   * Fetch a product by ID and enrich it with Payload CMS content
   */
  static async getEnrichedProduct(productId: string): Promise<EnrichedProduct | null> {
    try {
      // Fetch the product from Medusa
      const { product } = await medusaClient.products.retrieve(productId);
      
      if (!product) {
        return null;
      }
      
      // Fetch additional content from Payload CMS
      const payloadContent = await this.fetchPayloadContent(productId);
      
      // Fetch reviews from Payload CMS
      const reviews = await this.fetchProductReviews(productId);
      
      // Fetch seller information from Payload CMS
      const seller = product.metadata?.sellerId 
        ? await this.fetchSellerProfile(product.metadata.sellerId)
        : null;
      
      // Combine the data
      return {
        ...product,
        content: payloadContent,
        reviews,
        seller,
      };
    } catch (error) {
      console.error('Error fetching enriched product:', error);
      return null;
    }
  }
  
  /**
   * Fetch a list of products and enrich them with Payload CMS content
   */
  static async getEnrichedProducts(options: Record<string, any> = {}): Promise<{
    products: EnrichedProduct[];
    count: number;
  }> {
    try {
      // Fetch products from Medusa using their pagination parameters
      const { products, count } = await medusaClient.products.list(options);
      
      // Fetch additional content for these products
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          // Fetch content from Payload CMS
          const payloadContent = await this.fetchPayloadContent(product.id);
          
          // Fetch seller information
          const seller = product.metadata?.sellerId 
            ? await this.fetchSellerProfile(product.metadata.sellerId)
            : null;
          
          return {
            ...product,
            content: payloadContent,
            seller,
          };
        })
      );
      
      return {
        products: enrichedProducts,
        count,
      };
    } catch (error) {
      console.error('Error fetching enriched products:', error);
      return {
        products: [],
        count: 0,
      };
    }
  }
  
  /**
   * Fetch content for a product from Payload CMS
   */
  private static async fetchPayloadContent(productId: string): Promise<Record<string, any> | null> {
    try {
      // Fetch from Payload CMS API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/product-content?where[productId][equals]=${productId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product content: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.docs[0]?.content || null;
    } catch (error) {
      console.error('Error fetching product content from Payload:', error);
      return null;
    }
  }
  
  /**
   * Fetch reviews for a product from Payload CMS
   */
  private static async fetchProductReviews(productId: string): Promise<any[]> {
    try {
      // Fetch from Payload CMS API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/reviews?where[productId][equals]=${productId}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product reviews: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching product reviews from Payload:', error);
      return [];
    }
  }
  
  /**
   * Fetch seller profile from Payload CMS
   */
  private static async fetchSellerProfile(sellerId: string): Promise<any | null> {
    try {
      // Fetch from Payload CMS API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/sellers?where[id][equals]=${sellerId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch seller profile: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.docs[0] || null;
    } catch (error) {
      console.error('Error fetching seller profile from Payload:', error);
      return null;
    }
  }
}
