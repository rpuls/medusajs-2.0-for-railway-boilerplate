/**
 * One-off probe: fetch a few AS Colour products via the real API and
 * dump their full JSON to the log so we can discover what field (if any)
 * marks a style as discontinued / phased out / inactive / etc.
 *
 * We currently destructure only a handful of fields from the AS Colour
 * product payload (styleCode, productName, category, fabric, weight,
 * fit, gender, …) — the type ends with `[key: string]: any` so any
 * status/discontinued field exists on the response but isn't surfaced.
 *
 * Usage:
 *   PROBE_LIMIT=3 pnpm --filter backend medusa exec probe-ascolour-product-shape
 *   (or on Railway:)
 *   cd /app/.medusa/server && PROBE_LIMIT=3 npx medusa exec src/scripts/probe-ascolour-product-shape.js
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"

export default async function probeAscolourProductShape({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const limit = Number.parseInt(process.env.PROBE_LIMIT || "3", 10)

  let ascolour: AsColourService
  try {
    ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch {
    logger.error("AS Colour module not registered — set ASCOLOUR_* env vars.")
    return
  }

  logger.info(`AS Colour product-shape probe — fetching ${limit} product(s)…`)

  const products = await ascolour.fetchAllProducts()
  const sample = products.slice(0, limit)

  logger.info(`Fetched ${products.length} total; sampling first ${sample.length}.`)

  // Aggregate every top-level key across the sample so we can see what
  // fields the API actually returns (vs the subset our types destructure).
  const allKeys = new Set<string>()
  for (const p of sample) {
    for (const k of Object.keys(p as any)) allKeys.add(k)
  }
  logger.info(`[probe] union of top-level keys: [${[...allKeys].sort().join(", ")}]`)

  // Pretty-print each sampled product so we can eyeball the discontinued field.
  for (let i = 0; i < sample.length; i++) {
    const p = sample[i] as any
    // Drop heavy nested arrays for legibility; we want top-level fields.
    const lite = { ...p }
    if (Array.isArray(lite.variants)) lite.variants = `[${lite.variants.length} variants]`
    if (Array.isArray(lite.images)) lite.images = `[${lite.images.length} images]`
    logger.info(
      `[probe] product ${i + 1} (styleCode=${p.styleCode}): ${JSON.stringify(lite, null, 2).slice(0, 4000)}`
    )
  }

  // Heuristic flag: any field name containing "status", "active",
  // "phased", "discontin", or "run_out".
  const suspicious = [...allKeys].filter((k) =>
    /status|active|phased|discontin|runout|run_out|sunset|deprecat|retir/i.test(k)
  )
  if (suspicious.length) {
    logger.info(
      `[probe] suspicious "discontinued-marker" candidates: [${suspicious.join(", ")}]`
    )
    for (const p of sample) {
      const snapshot: Record<string, unknown> = { styleCode: (p as any).styleCode }
      for (const k of suspicious) snapshot[k] = (p as any)[k]
      logger.info(`[probe] ${(p as any).styleCode}: ${JSON.stringify(snapshot)}`)
    }
  } else {
    logger.info(
      "[probe] No obvious discontinued-marker candidates in top-level keys. Inspect the full payload above; it may be a nested flag or a boolean named something unexpected."
    )
  }
}
