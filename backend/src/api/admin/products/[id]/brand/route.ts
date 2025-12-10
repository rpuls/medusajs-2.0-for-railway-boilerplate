import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../../modules/brand"

/**
 * GET /admin/products/:id/brand
 * Get the brand linked to a product
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const logger = req.scope.resolve("logger")

    // Query the link table directly using raw SQL
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found in environment")
    }
    
    const { Pool } = await import("pg")
    const pool = new Pool({ connectionString: databaseUrl })
    const linkTableName = "product_product_brand_brand"

    try {
      // Query the link table to find brand linked to this product
      const result = await pool.query(
        `SELECT brand_id FROM ${linkTableName} WHERE product_id = $1 LIMIT 1`,
        [id]
      )

      if (!result.rows || result.rows.length === 0) {
        res.json({ brand: null })
        return
      }

      const brandId = result.rows[0].brand_id

      if (!brandId) {
        res.json({ brand: null })
        return
      }

      const brandService = req.scope.resolve<import("../../../../../modules/brand/service").default>(BRAND_MODULE)
      const brand = await brandService.retrieveBrand(brandId)

      res.json({ brand })
    } finally {
      // Always close the pool if it was created
      await pool.end().catch((err: any) => {
        logger?.error("Error closing database pool:", err)
      })
    }
  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger?.error("Error fetching product brand:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to get product brand",
    })
  }
}

/**
 * PUT /admin/products/:id/brand
 * Link or unlink a brand to/from a product
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as { brand_id: string | null }
    const logger = req.scope.resolve("logger")

    // Get database connection
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found in environment")
    }
    
    const { Pool } = await import("pg")
    const pool = new Pool({ connectionString: databaseUrl })
    const linkTableName = "product_product_brand_brand"

    try {
      // First, remove any existing brand links for this product
      await pool.query(
        `DELETE FROM ${linkTableName} WHERE product_id = $1`,
        [id]
      )

      // If a brand_id is provided, create a new link
      if (body.brand_id) {
        // Check if link already exists (shouldn't happen after delete, but just in case)
        const existingResult = await pool.query(
          `SELECT id FROM ${linkTableName} WHERE product_id = $1 AND brand_id = $2`,
          [id, body.brand_id]
        )

        if (existingResult.rows.length === 0) {
          // Generate a unique ID for the link row
          const { randomUUID } = await import("crypto")
          const linkId = randomUUID()

          // Insert the new link
          await pool.query(
            `INSERT INTO ${linkTableName} (id, product_id, brand_id) VALUES ($1, $2, $3)`,
            [linkId, id, body.brand_id]
          )
        }

        const brandService = req.scope.resolve<import("../../../../../modules/brand/service").default>(BRAND_MODULE)
        const brand = await brandService.retrieveBrand(body.brand_id)

        res.json({ brand })
      } else {
        // Brand was unlinked
        res.json({ brand: null })
      }
    } finally {
      // Always close the pool if it was created
      await pool.end().catch((err: any) => {
        logger?.error("Error closing database pool:", err)
      })
    }
  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger?.error("Error updating product brand:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product brand",
    })
  }
}

