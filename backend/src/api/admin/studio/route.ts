import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { buildStudioDashboard } from "../../../services/studio-dashboard/build"

/**
 * GET /admin/studio
 *   → { buckets: StudioBucket[] }
 *
 * Powers the Studio "who's worth your attention today" admin page.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const buckets = await buildStudioDashboard(req.scope)
  return res.json({ buckets })
}
