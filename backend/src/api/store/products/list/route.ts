import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../modules/brand"

/**
 * GET /store/products/list
 * Get products with server-side filtering including brand filtering
 * Supports: brand_id, collection_id, category_id, limit, offset, order, region_id, id, fields
 * Returns: { products: StoreProduct[], count: number }
 * 
 * This endpoint extends the MedusaJS store product API with brand filtering.
 * It queries the link table to get product IDs for brands, then calls the
 * built-in MedusaJS store product API endpoint internally to ensure proper
 * formatting with pricing and variants.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const {
      brand_id,
      collection_id,
      category_id,
      limit,
      offset,
      order,
      region_id,
      id,
      fields,
    } = req.query

    // Normalize brand_id to array
    const brandIds = Array.isArray(brand_id)
      ? brand_id.filter(Boolean)
      : brand_id
      ? [brand_id]
      : []

    // If brand filtering is active, get product IDs for those brands using raw SQL
    let brandFilteredProductIds: string[] = []
    if (brandIds.length > 0) {
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("DATABASE_URL not found in environment")
      }

      const { Pool } = await import("pg")
      const pool = new Pool({ connectionString: databaseUrl })
      const linkTableName = "product_product_brand_brand"

      try {
        const productIdsSet = new Set<string>()

        for (const brandId of brandIds) {
          try {
            // Query the link table directly using raw SQL
            const result = await pool.query(
              `SELECT product_id FROM ${linkTableName} WHERE brand_id = $1`,
              [brandId]
            )

            if (result.rows && Array.isArray(result.rows)) {
              result.rows.forEach((row: any) => {
                if (row.product_id) {
                  productIdsSet.add(row.product_id)
                }
              })
            }
          } catch (error) {
            // Log error but continue with other brands
            console.error(`Error querying links for brand ${brandId}:`, error)
          }
        }

        brandFilteredProductIds = Array.from(productIdsSet)

        // If no products found for brands, return empty result
        if (brandFilteredProductIds.length === 0) {
          await pool.end()
          res.json({ products: [], count: 0 })
          return
        }

        await pool.end()
      } catch (error) {
        console.error("Error querying brand links:", error)
        // Try to close pool if it exists
        try {
          await pool.end()
        } catch {}
        throw error
      }
    }

    // Build query params for MedusaJS store product API
    const queryParams: any = {}

    // Combine brand-filtered IDs with explicitly provided product IDs
    let finalProductIds: string[] = []
    if (brandFilteredProductIds.length > 0) {
      // Normalize existing id param
      const existingIds: string[] = Array.isArray(id)
        ? id.map((id) => String(id)).filter(Boolean)
        : id
        ? [String(id)]
        : []

      if (existingIds.length > 0) {
        // Intersection: only products that match both brand filter and explicit IDs
        finalProductIds = existingIds.filter((id) =>
          brandFilteredProductIds.includes(id)
        )
      } else {
        // Use brand-filtered IDs
        finalProductIds = brandFilteredProductIds
      }
    } else {
      // No brand filter, use existing id param if provided
      if (id) {
        finalProductIds = Array.isArray(id)
          ? id.map((id) => String(id)).filter(Boolean) as string[]
          : [String(id)]
      }
    }

    if (finalProductIds.length > 0) {
      queryParams.id = finalProductIds
    }

    // Add other filters
    if (collection_id) {
      queryParams.collection_id = Array.isArray(collection_id)
        ? collection_id.map((id) => String(id))
        : [String(collection_id)]
    }
    if (category_id) {
      queryParams.category_id = Array.isArray(category_id)
        ? category_id.map((id) => String(id))
        : [String(category_id)]
    }
    if (region_id) {
      queryParams.region_id = region_id
    }
    if (limit) {
      queryParams.limit = limit
    }
    if (offset) {
      queryParams.offset = offset
    }
    if (order) {
      queryParams.order = order
    }
    if (fields) {
      queryParams.fields = fields
    }

    // Use the product module service to query products
    // Note: Products returned may not have calculated prices
    // The storefront will fetch priced products separately using getProductsById
    const productService = req.scope.resolve(Modules.PRODUCT)
    
    // Build filters for product service
    const productFilters: any = {}
    if (finalProductIds.length > 0) {
      productFilters.id = finalProductIds
    }
    if (collection_id) {
      const collectionIds = Array.isArray(collection_id)
        ? collection_id.filter(Boolean)
        : [collection_id]
      productFilters.collection_id = collectionIds
    }
    if (category_id) {
      const categoryIds = Array.isArray(category_id)
        ? category_id.filter(Boolean)
        : [category_id]
      productFilters.category_id = categoryIds
    }

    const limitNum = limit ? parseInt(limit as string, 10) : 12
    const offsetNum = offset ? parseInt(offset as string, 10) : 0

    const queryOptions: any = {
      take: limitNum,
      skip: offsetNum,
    }

    if (order) {
      queryOptions.order = order
    }

    // Query products using product service
    // Note: Products returned here may not have calculated prices
    // The storefront will fetch priced products separately using getProductsById
    
    let products: any[] = []
    let count = 0

    try {
      // If we have product IDs to filter by, fetch them individually
      // The product service might not support id array filtering
      if (finalProductIds.length > 0) {
        console.log(`[GET /store/products/list] Fetching ${finalProductIds.length} products by ID`)
        
        // Fetch products individually (product service doesn't reliably support id array)
        const fetchedProducts = await Promise.all(
          finalProductIds.map((productId) =>
            productService.retrieveProduct(productId).catch((err) => {
              console.error(`Error fetching product ${productId}:`, err)
              return null
            })
          )
        )
        
        // Filter out nulls (products that failed to fetch)
        let filteredProducts = fetchedProducts.filter(Boolean) as any[]
        
        // Apply collection filter if needed
        if (collection_id) {
          const collectionIds = Array.isArray(collection_id)
            ? collection_id.map((id) => String(id))
            : [String(collection_id)]
          filteredProducts = filteredProducts.filter((product: any) =>
            product.collection_id && collectionIds.includes(product.collection_id)
          )
        }
        
        // Apply category filter if needed
        if (category_id) {
          const categoryIds = Array.isArray(category_id)
            ? category_id.map((id) => String(id))
            : [String(category_id)]
          filteredProducts = filteredProducts.filter((product: any) => {
            if (!product.categories || !Array.isArray(product.categories)) {
              return false
            }
            return product.categories.some((cat: any) =>
              categoryIds.includes(cat.id)
            )
          })
        }
        
        // Apply sorting if needed
        if (order === "created_at") {
          filteredProducts.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime()
            const dateB = new Date(b.created_at || 0).getTime()
            return dateB - dateA // Newest first
          })
        }
        
        // Apply pagination
        count = filteredProducts.length
        const startIndex = offsetNum
        const endIndex = startIndex + limitNum
        products = filteredProducts.slice(startIndex, endIndex)
        
        console.log(`[GET /store/products/list] Returning ${products.length} products (${startIndex}-${endIndex} of ${count})`)
      } else {
        // No ID filtering, use standard query
        console.log(`[GET /store/products/list] Fetching products with filters:`, productFilters)
        const [fetchedProducts, fetchedCount] = await productService.listAndCountProducts(
          Object.keys(productFilters).length > 0 ? productFilters : undefined,
          queryOptions
        )
        products = fetchedProducts
        count = fetchedCount
      }

      // Ensure products have required fields for storefront
      // The storefront extracts product IDs and fetches priced versions separately
      const formattedProducts = products.map((product: any) => {
        // Return product with at least id field (required for getProductsById)
        return {
          id: product.id,
          ...product,
        }
      })

      res.json({
        products: formattedProducts,
        count,
      })
    } catch (serviceError) {
      console.error("Error querying product service:", serviceError)
      const errorDetails = serviceError instanceof Error 
        ? { message: serviceError.message, stack: serviceError.stack }
        : { error: String(serviceError) }
      console.error("Service error details:", errorDetails)
      throw serviceError
    }
  } catch (error) {
    console.error("Error in /store/products/list:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to list products"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      query: req.query,
    })
    
    res.status(500).json({
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
    })
  }
}
