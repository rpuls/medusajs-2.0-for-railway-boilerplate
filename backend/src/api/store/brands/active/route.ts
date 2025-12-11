import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../modules/brand"

import BrandModuleService from "../../../../modules/brand/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  try {
    // Get all brands
    const allBrands = await brandService.listBrands({})
    console.log(`[GET /store/brands/active] Found ${allBrands.length} total brands`)

    // Count products per brand using raw SQL (more reliable than link.list)
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found in environment")
    }

    const { Pool } = await import("pg")
    const pool = new Pool({ connectionString: databaseUrl })
    const linkTableName = "product_product_brand_brand"

    try {
      // Count products per brand using raw SQL
      const brandsWithCounts = await Promise.all(
        allBrands.map(async (brand: any) => {
          try {
            // Query the link table directly to count products
            const result = await pool.query(
              `SELECT COUNT(*) as count FROM ${linkTableName} WHERE brand_id = $1`,
              [brand.id]
            )

            const productCount = parseInt(result.rows[0]?.count || "0", 10)
            console.log(`[GET /store/brands/active] Brand ${brand.id} (${brand.name}): ${productCount} products`)

            return {
              ...brand,
              product_count: productCount,
            }
          } catch (error) {
            // If query fails, return brand with 0 count
            console.error(`Error counting products for brand ${brand.id}:`, error)
            return {
              ...brand,
              product_count: 0,
            }
          }
        })
      )

      // Filter to only brands with products (active brands)
      const activeBrands = brandsWithCounts.filter(
        (brand: any) => brand.product_count > 0
      )

      console.log(`[GET /store/brands/active] Returning ${activeBrands.length} active brands`)
      res.json({ brands: activeBrands })
    } finally {
      // Always close the pool
      await pool.end().catch((err: any) => {
        console.error("Error closing database pool:", err)
      })
    }
  } catch (error) {
    console.error("Error in /store/brands/active:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to list active brands",
    })
  }
}

