import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../../../../modules/ascolour"
import AsColourService from "../../../../modules/ascolour/service"

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const handleForStyle = (styleCode: string, productName?: string) => {
  const name = productName ?? styleCode
  return `as-colour-${slugify(`${name}-${styleCode}`)}`
}

/**
 * GET /admin/ascolour/catalog
 *
 * Fetches the AS Colour product catalogue and annotates each product with
 * whether it already exists in Medusa.
 *
 * Query params:
 *   search  — filter by productName or styleCode (case-insensitive)
 *   limit   — page size (default 50)
 *   offset  — pagination offset (default 0)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let ascolour: AsColourService
  try {
    ascolour = req.scope.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch {
    return res.status(503).json({ error: "AS Colour module not configured." })
  }

  const search = ((req.query.search as string | undefined) ?? "").trim().toLowerCase()
  const limit = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 200)
  const offset = Math.max(Number(req.query.offset ?? 0), 0)

  // Fetch full catalog (paginated API, returns all pages)
  let products = await ascolour.fetchAllProducts()

  // Filter by search
  if (search) {
    products = products.filter(
      (p) =>
        (p as any).productName?.toLowerCase().includes(search) ||
        p.styleCode?.toLowerCase().includes(search) ||
        (p as any).styleName?.toLowerCase().includes(search)
    )
  }

  const total = products.length
  const page = products.slice(offset, offset + limit)

  // Check which handles already exist in Medusa
  const handles = page.map((p) => handleForStyle(p.styleCode, (p as any).productName))
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  })
  const existingHandles = new Set((existing ?? []).map((p: any) => p.handle as string))

  const rows = page.map((p) => {
    const handle = handleForStyle(p.styleCode, (p as any).productName)
    const rawStyleName = (p as any).styleName ?? ""
    const cleanedName = rawStyleName.replace(/\s*\|\s*\d+[A-Z]*\s*$/, "").trim()
    return {
      style_code: p.styleCode,
      name: cleanedName || (p as any).productName || p.styleCode,
      category: (p as any).category ?? (p as any).productType ?? null,
      handle,
      already_imported: existingHandles.has(handle),
    }
  })

  return res.json({ products: rows, total, offset, limit })
}
