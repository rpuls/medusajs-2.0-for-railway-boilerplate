import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { AUSSIEPACIFIC_MODULE } from "../../../../modules/aussiepacific"
import AussiePacificService from "../../../../modules/aussiepacific/service"
import {
  AussiePacificProduct,
} from "../../../../modules/aussiepacific/types"
import { handleForProduct } from "../../../../modules/aussiepacific/mapping"

/**
 * Cache the full AP stub list for 5 minutes so paginating / searching in
 * the admin UI doesn't trigger a fresh ~50s catalog walk every time.
 * Bypass with `?refresh=1`.
 */
const STUB_CACHE_KEY = "aussiepacific:admin:stubs:v1"
const STUB_CACHE_TTL_SECONDS = 5 * 60

async function getCachedStubs(
  req: MedusaRequest,
  ap: AussiePacificService,
  forceRefresh: boolean
): Promise<AussiePacificProduct[]> {
  let cache: any = null
  try {
    cache = req.scope.resolve(Modules.CACHE)
  } catch {
    // Cache module not registered — fall through to a live fetch.
  }

  if (cache && !forceRefresh) {
    try {
      const cached = await cache.get(STUB_CACHE_KEY)
      if (Array.isArray(cached) && cached.length > 0) {
        return cached as AussiePacificProduct[]
      }
    } catch {
      // Cache read failure — ignore and re-fetch.
    }
  }

  const stubs = await ap.fetchAllProductStubs()
  if (cache && stubs.length > 0) {
    try {
      await cache.set(STUB_CACHE_KEY, stubs, STUB_CACHE_TTL_SECONDS)
    } catch {
      // Cache write failure — non-fatal.
    }
  }
  return stubs
}

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
 *   refresh               — "1" to bypass the 5-min server-side cache
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
  const forceRefresh =
    req.query.refresh === "1" || req.query.refresh === "true"

  // Fetch all stubs from AP API (5-min cache; bypass with ?refresh=1).
  let stubs: AussiePacificProduct[]
  try {
    stubs = await getCachedStubs(req, ap, forceRefresh)
  } catch (err: any) {
    const msg = err?.message ?? String(err)
    console.error(`[aussie-pacific/catalog] fetchAllProductStubs failed:`, msg)
    return res.status(502).json({
      error: `Aussie Pacific catalog fetch failed: ${msg}`,
    })
  }

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
