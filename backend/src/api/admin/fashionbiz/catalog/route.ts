import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { FASHIONBIZ_MODULE } from "../../../../modules/fashionbiz"
import FashionBizService from "../../../../modules/fashionbiz/service"
import { FashionBizBrandSlug } from "../../../../modules/fashionbiz/types"
import { handleForProduct } from "../../../../modules/fashionbiz/mapping"

const VALID_BRANDS = new Set<FashionBizBrandSlug>([
  "biz-collection",
  "biz-care",
  "biz-corporates",
  "syzmik",
  "good-mates",
])

/**
 * GET /admin/fashionbiz/catalog
 *
 * Fetches the live FashionBiz product list for a brand and annotates each
 * product with whether it already exists in Medusa (keyed by handle).
 *
 * Query params:
 *   brand   — FashionBiz brand slug (required)
 *   search  — filter by name or code (case-insensitive)
 *   limit   — page size (default 50)
 *   offset  — pagination offset (default 0)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let fashionbiz: FashionBizService
  try {
    fashionbiz = req.scope.resolve(FASHIONBIZ_MODULE) as FashionBizService
  } catch {
    return res.status(503).json({ error: "FashionBiz module not configured. Set FASHIONBIZ_API_TOKEN." })
  }

  const brand = (req.query.brand as string | undefined)?.trim() as FashionBizBrandSlug | undefined
  if (!brand || !VALID_BRANDS.has(brand)) {
    return res.status(400).json({
      error: `Invalid brand. Must be one of: ${[...VALID_BRANDS].join(", ")}`,
    })
  }

  const search = ((req.query.search as string | undefined) ?? "").trim().toLowerCase()
  const limit = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 200)
  const offset = Math.max(Number(req.query.offset ?? 0), 0)

  // Fetch all stubs from FashionBiz API (no server-side pagination on their end)
  let stubs = await fashionbiz.fetchAllProductsForBrand(brand)

  // Filter by search
  if (search) {
    stubs = stubs.filter(
      (s) =>
        s.name?.toLowerCase().includes(search) ||
        s.code?.toLowerCase().includes(search) ||
        s.slug?.toLowerCase().includes(search)
    )
  }

  const total = stubs.length
  const page = stubs.slice(offset, offset + limit)

  // Check which handles already exist in Medusa
  const handles = page.map((s) => handleForProduct(brand, s.slug))
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  })
  const existingHandles = new Set((existing ?? []).map((p: any) => p.handle as string))

  const products = page.map((s) => ({
    slug: s.slug,
    code: s.code,
    name: s.name,
    brand,
    handle: handleForProduct(brand, s.slug),
    already_imported: existingHandles.has(handleForProduct(brand, s.slug)),
  }))

  return res.json({ products, total, offset, limit })
}
