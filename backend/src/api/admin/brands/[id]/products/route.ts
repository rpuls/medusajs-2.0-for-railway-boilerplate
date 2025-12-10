import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"
import BrandModuleService from "../../../../../modules/brand/service"

/**
 * GET /admin/brands/:id/products
 * Get products linked to a brand
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({
        message: "Brand ID is required",
      })
      return
    }

    const logger = req.scope.resolve("logger")

    // Query links to find products linked to this brand
    // Since getLinkModule returns false, query the database table directly using raw SQL
    // The table name is product_product_brand_brand with columns product_id and brand_id
    let pool: any = null
    try {
      // Get database connection from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("DATABASE_URL not found in environment")
      }
      
      // Import pg for raw SQL queries
      const { Pool } = await import("pg")
      pool = new Pool({ connectionString: databaseUrl })
      
      const linkTableName = "product_product_brand_brand"
      
      // Query the link table directly using raw SQL
      const result = await pool.query(
        `SELECT product_id FROM ${linkTableName} WHERE brand_id = $1`,
        [id]
      )
      
      const productIds: string[] = []
      if (result.rows && Array.isArray(result.rows)) {
        result.rows.forEach((row: any) => {
          if (row.product_id) {
            productIds.push(row.product_id)
          }
        })
      }
      
      logger?.info(`Found ${productIds.length} products linked to brand ${id}`)
      res.json({ products: productIds.map((id) => ({ id })) })
    } catch (linkError) {
      const errorMsg = linkError instanceof Error ? linkError.message : String(linkError)
      const errorStack = linkError instanceof Error ? linkError.stack : undefined
      logger?.error(`Link query error: ${errorMsg} (productModule=${Modules.PRODUCT}, brandModule=${BRAND_MODULE}, brandId=${id})`)
      if (errorStack) {
        logger?.error(`Error stack: ${errorStack}`)
      }
      throw linkError
    } finally {
      // Always close the pool if it was created
      if (pool) {
        await pool.end().catch((err: any) => {
          logger?.error("Error closing database pool:", err)
        })
      }
    }
  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger?.error("Error fetching brand products:", error)
    
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to get brand products",
    })
  }
}

/**
 * POST /admin/brands/:id/products
 * Add or remove products from a brand
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as { add?: string[]; remove?: string[] }
    const logger = req.scope.resolve("logger")

    // Get database connection from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found in environment")
    }
    
    // Import pg for raw SQL queries
    const { Pool } = await import("pg")
    const pool = new Pool({ connectionString: databaseUrl })
    const linkTableName = "product_product_brand_brand"

    try {
      // Remove products if specified
      if (body.remove && body.remove.length > 0) {
        logger?.info(`Removing ${body.remove.length} products from brand ${id}`)
        // Delete rows where product_id IN (remove array) AND brand_id = id
        const placeholders = body.remove.map((_, index) => `$${index + 2}`).join(", ")
        await pool.query(
          `DELETE FROM ${linkTableName} WHERE brand_id = $1 AND product_id IN (${placeholders})`,
          [id, ...body.remove]
        )
        logger?.info(`Successfully removed ${body.remove.length} products from brand ${id}`)
      }

      // Add products if specified
      if (body.add && body.add.length > 0) {
        logger?.info(`Adding ${body.add.length} products to brand ${id}`)
        
        // First, check which products are already linked to avoid duplicates
        const existingResult = await pool.query(
          `SELECT product_id FROM ${linkTableName} WHERE brand_id = $1`,
          [id]
        )
        
        const existingProductIds = new Set(
          existingResult.rows.map((row: any) => row.product_id).filter(Boolean)
        )

        // Filter out products that are already linked
        const newProductIds = body.add.filter(
          (productId) => !existingProductIds.has(productId)
        )

        if (newProductIds.length > 0) {
          // Insert new links using a single query with multiple values
          // Build parameterized query: VALUES ($1, $2), ($3, $4), ...
          // Link table has brand_id and product_id columns (no id column)
          const values: string[] = []
          const params: string[] = []
          
          newProductIds.forEach((productId, index) => {
            const paramIndex = index * 2 + 1
            values.push(`($${paramIndex}, $${paramIndex + 1})`)
            params.push(id, productId)
          })
          
          await pool.query(
            `INSERT INTO ${linkTableName} (brand_id, product_id) VALUES ${values.join(", ")}`,
            params
          )
          logger?.info(`Successfully added ${newProductIds.length} products to brand ${id}`)
        } else {
          logger?.info(`All ${body.add.length} products were already linked to brand ${id}`)
        }
      }

      // Get updated brand
      const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
      const brand = await brandService.retrieveBrand(id)

      // Calculate product count
      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM ${linkTableName} WHERE brand_id = $1`,
        [id]
      )
      const productCount = parseInt(countResult.rows[0]?.count || "0", 10)

      // Add product_count to the brand object
      const brandWithCount = {
        ...brand,
        product_count: productCount,
      }

      res.json({ brand: brandWithCount })
    } finally {
      // Always close the pool if it was created
      await pool.end().catch((err: any) => {
        logger?.error("Error closing database pool:", err)
      })
    }
  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger?.error("Error updating brand products:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update brand products",
    })
  }
}

