import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/reports/config
 *
 * Frontend-visible configuration for the Reports page tiles. Anything that's
 * a deep-link URL or a small flag the admin UI needs to know about goes
 * here, fetched on mount. Avoids needing to inject NEXT_PUBLIC_* env vars
 * into the admin bundle at build time.
 *
 * Don't put secrets in this response — admin auth gates the route but the
 * shape is meant for client-side rendering.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    vercel_speed_insights_url: process.env.VERCEL_SPEED_INSIGHTS_URL ?? null,
  })
}
