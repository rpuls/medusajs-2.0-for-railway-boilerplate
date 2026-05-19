import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import { POS_SESSION_MODULE } from "../modules/pos-session"
import type POSSessionModuleService from "../modules/pos-session/service"

/**
 * Hourly housekeeping for POS sessions. Sessions are created on-demand
 * by every visit to /app/pos and only auto-die when the staff member
 * either completes checkout or hits "new transaction". Abandoned
 * sessions (customer walked away, browser tab closed) sit as
 * `status = "active"` forever past their `expires_at` and clutter the
 * "owned by me, active" picker.
 *
 * Pure SQL bulk-update — no per-row work. Idempotent: a session
 * already `completed` / `cancelled` / `expired` isn't touched.
 */
export default async function expirePOSSessionsJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve(POS_SESSION_MODULE) as POSSessionModuleService

  const now = new Date()
  const candidates = await (service as any).listPosSessions(
    { status: "active" },
    { take: 500, order: { expires_at: "ASC" } }
  )

  const expired = (candidates as any[]).filter((s) => {
    const exp = s.expires_at ? new Date(s.expires_at).getTime() : null
    return exp !== null && exp < now.getTime()
  })

  if (expired.length === 0) {
    return
  }

  for (const row of expired) {
    try {
      await (service as any).updatePosSessions({
        id: row.id,
        status: "expired",
      })
    } catch (err: any) {
      logger.warn(
        `expire-pos-sessions: failed to expire ${row.id}: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `expire-pos-sessions: expired=${expired.length} (of ${candidates.length} active checked)`
  )
}

export const config = {
  name: "expire-pos-sessions",
  schedule: "30 * * * *",
}
