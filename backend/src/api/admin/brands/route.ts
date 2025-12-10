import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

/**
 * GET /admin/brands
 * List all brands
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
    const brands = await brandService.listBrands({})

    // Calculate product counts for all brands
    const brandsArray = Array.isArray(brands) ? brands : [brands]
    const brandIds = brandsArray.map((b: any) => b.id)

    let productCounts: Record<string, number> = {}
    let pool: any = null
    try {
      const databaseUrl = process.env.DATABASE_URL
      if (databaseUrl && brandIds.length > 0) {
        const { Pool } = await import("pg")
        pool = new Pool({ connectionString: databaseUrl })
        
        // Query counts for all brands in a single query
        const placeholders = brandIds.map((_, index) => `$${index + 1}`).join(", ")
        const result = await pool.query(
          `SELECT brand_id, COUNT(*) as count FROM product_product_brand_brand WHERE brand_id IN (${placeholders}) GROUP BY brand_id`,
          brandIds
        )
        
        // Build a map of brand_id -> count
        result.rows.forEach((row: any) => {
          productCounts[row.brand_id] = parseInt(row.count || "0", 10)
        })
      }
    } catch (countError) {
      // Log error but don't fail the request
      const logger = req.scope.resolve("logger")
      logger?.error("Failed to calculate product counts:", countError)
    } finally {
      // Always close the pool if it was created
      if (pool) {
        await pool.end().catch((err: any) => {
          const logger = req.scope.resolve("logger")
          logger?.error("Error closing database pool:", err)
        })
      }
    }

    // Add product_count to each brand
    const brandsWithCounts = brandsArray.map((brand: any) => ({
      ...brand,
      product_count: productCounts[brand.id] || 0,
    }))

    res.json({ brands: brandsWithCounts })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to list brands",
    })
  }
}

/**
 * POST /admin/brands
 * Create a new brand
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const body = req.body as { name: string; image_url?: string }

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      res.status(400).json({
        message: "Missing required field: name",
      })
      return
    }

    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
    const brands = await brandService.createBrands([
      {
        name: body.name.trim(),
        image_url: body.image_url || null,
      },
    ])

    const brand = Array.isArray(brands) ? brands[0] : brands
    res.json({ brand })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create brand",
    })
  }
}

