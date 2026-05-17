import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { AUSSIEPACIFIC_MODULE } from "../../../../modules/aussiepacific"
import AussiePacificService from "../../../../modules/aussiepacific/service"
import { handleForProduct } from "../../../../modules/aussiepacific/mapping"

/**
 * GET /admin/aussie-pacific/catalog
 *
 * Fetches the live Aussie Pacific product list (stub mode — no variants
 * or images, for speed) and annotates each product with whether it already
 * exists in Medusa.
 *
 * Discontinued styles (`run_out: true`) are filtered out by default so the
 * admin never sees them. Set `?include_discontinued=1` to surface them.
 *
 * Query params:
 *   search                — filter by name, style_code, or style (case-insensitive)
 *   limit                 — page size (default 50, max 200)
 *   offset                — pagination offset (default 0)
 *   include_discontinued  — "1" to include run_out=true styles (default: filtered out)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let ap: AussiePacificService
  try {
    ap = req.scope.resolve(AUSSIEPACIFIC_MODULE) as AussiePacificService
  } catch {
    return res.status(503).json({
      error: "Aussie Pacific module not configured. Set AUSSIE_PACIFIC_API_TOKEN.",
    })
  }

  const search = ((req.query.search as string | undefined) ?? "")
    .trim()
    .toLowerCase()
  const limit = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 200)
  const offset = Math.max(Number(req.query.offset ?? 0), 0)
  const includeDiscontinued =
    req.query.include_discontinued === "1" ||
    req.query.include_discontinued === "true"

  // Fetch all stubs from AP API (no variants/images for speed).
  let stubs = await ap.fetchAllProductStubs()

  // Filter discontinued unless explicitly requested.
  if (!includeDiscontinued) {
    stubs = stubs.filter((p) => p.run_out !== true)
  }

  // Search filter.
  if (search) {
    stubs = stubs.filter(
      (s) =>
        s.name?.toLowerCase().includes(search) ||
        String(s.style_code ?? "").toLowerCase().includes(search) ||
        (s.style ?? "").toLowerCase().includes(search) ||
        (s.main_category ?? "").toLowerCase().includes(search) ||
        (s.sub_category ?? "").toLowerCase().includes(search)
    )
  }

  const total = stubs.length
  const page = stubs.slice(offset, offset + limit)

  // Check which handles already exist in Medusa.
  const handles = page.map((s) => handleForProduct(s.style_code))
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  })
  const existingHandles = new Set(
    (existing ?? []).map((p: any) => p.handle as string)
  )

  const products = page.map((s) => ({
    style_code: s.style_code,
    name: s.name,
    style: s.style,
    main_category: s.main_category,
    sub_category: s.sub_category,
    run_out: s.run_out === true,
    handle: handleForProduct(s.style_code),
    already_imported: existingHandles.has(handleForProduct(s.style_code)),
  }))

  return res.json({ products, total, offset, limit })
}
