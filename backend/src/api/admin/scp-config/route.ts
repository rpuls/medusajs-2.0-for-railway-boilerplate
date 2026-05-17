import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/scp-config
 *
 * Returns public runtime config that admin widgets need to build URLs
 * pointing at the storefront (e.g. for the "Customise position" iframe).
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const storefront_url = (process.env.STOREFRONT_URL ?? "").replace(/\/$/, "")
  const country_code = process.env.STOREFRONT_DEFAULT_COUNTRY_CODE ?? "au"
  res.json({ storefront_url, country_code })
}
