import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../modules/brand"
import BrandModuleService from "../../../../modules/brand/service"

/**
 * GET /admin/brands/:id
 * Get a single brand by ID
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

    const brand = await brandService.retrieveBrand(id)

    if (!brand) {
      res.status(404).json({
        message: `Brand with id "${id}" not found`,
      })
      return
    }

    // Calculate product count by querying the link table
    let productCount = 0
    let pool: any = null
    try {
      const databaseUrl = process.env.DATABASE_URL
      if (databaseUrl) {
        const { Pool } = await import("pg")
        pool = new Pool({ connectionString: databaseUrl })
        
        const result = await pool.query(
          `SELECT COUNT(*) as count FROM product_product_brand_brand WHERE brand_id = $1`,
          [id]
        )
        
        productCount = parseInt(result.rows[0]?.count || "0", 10)
      }
    } catch (countError) {
      // Log error but don't fail the request
      const logger = req.scope.resolve("logger")
      logger?.error("Failed to calculate product count:", countError)
    } finally {
      // Always close the pool if it was created
      if (pool) {
        await pool.end().catch((err: any) => {
          const logger = req.scope.resolve("logger")
          logger?.error("Error closing database pool:", err)
        })
      }
    }

    // Add product_count to the brand object
    const brandWithCount = {
      ...brand,
      product_count: productCount,
    }

    res.json({ brand: brandWithCount })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to retrieve brand",
    })
  }
}

/**
 * PUT /admin/brands/:id
 * Update a brand
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as { name?: string; image_url?: string }

    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

    // Build update data
    const updateData: any = {}
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        res.status(400).json({
          message: "Invalid name: must be a non-empty string",
        })
        return
      }
      updateData.name = body.name.trim()
    }
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || null
    }

    const updated = await brandService.updateBrands({ id }, updateData)
    const brand = Array.isArray(updated) && updated.length > 0 ? updated[0] : updated

    // Calculate product count
    let productCount = 0
    let pool: any = null
    try {
      const databaseUrl = process.env.DATABASE_URL
      if (databaseUrl) {
        const { Pool } = await import("pg")
        pool = new Pool({ connectionString: databaseUrl })
        
        const result = await pool.query(
          `SELECT COUNT(*) as count FROM product_product_brand_brand WHERE brand_id = $1`,
          [id]
        )
        
        productCount = parseInt(result.rows[0]?.count || "0", 10)
      }
    } catch (countError) {
      // Log error but don't fail the request
      const logger = req.scope.resolve("logger")
      logger?.error("Failed to calculate product count:", countError)
    } finally {
      // Always close the pool if it was created
      if (pool) {
        await pool.end().catch((err: any) => {
          const logger = req.scope.resolve("logger")
          logger?.error("Error closing database pool:", err)
        })
      }
    }

    // Add product_count to the brand object
    const brandWithCount = {
      ...brand,
      product_count: productCount,
    }

    res.json({ brand: brandWithCount })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update brand",
    })
  }
}

/**
 * DELETE /admin/brands/:id
 * Delete a brand
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

    await brandService.deleteBrands({ id })

    res.status(200).json({
      id,
      object: "brand",
      deleted: true,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to delete brand",
    })
  }
}

