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
      "[probe] No obvious discontinued-marker candidates in top-level keys."
    )
  }

  // Hypothesis check: AS Colour appends an "S" to styleCodes (and possibly
  // colour SKUs) to mark them as discontinued/superseded. Walk every fetched
  // product and report the distribution + sample suffixes.
  const sSuffixStyles: Array<{ styleCode: string; styleName?: string; productType?: string }> = []
  for (const p of products) {
    const code = String((p as any).styleCode ?? "")
    if (/S$/.test(code)) {
      sSuffixStyles.push({
        styleCode: code,
        styleName: (p as any).styleName,
        productType: (p as any).productType,
      })
    }
  }
  logger.info(
    `[probe] styleCodes ending in "S": ${sSuffixStyles.length} / ${products.length} (${((sSuffixStyles.length / products.length) * 100).toFixed(1)}%)`
  )
  // Sample up to 20 to eyeball whether they look discontinued.
  for (const s of sSuffixStyles.slice(0, 20)) {
    logger.info(
      `[probe]   ${s.styleCode}  type="${s.productType ?? ""}"  name="${s.styleName ?? ""}"`
    )
  }
  if (sSuffixStyles.length > 20) {
    logger.info(`[probe]   …and ${sSuffixStyles.length - 20} more.`)
  }
  // Also list a few styles where both base (e.g. "5050") and S-suffix
  // ("5050S") exist — that's the strongest signal AS Colour uses "S" for
  // supersession.
  const codes = new Set(products.map((p) => String((p as any).styleCode ?? "")))
  const pairs: Array<{ base: string; sCode: string }> = []
  for (const code of codes) {
    if (/S$/.test(code)) {
      const base = code.slice(0, -1)
      if (codes.has(base)) {
        pairs.push({ base, sCode: code })
      }
    }
  }
  if (pairs.length) {
    logger.info(
      `[probe] paired base↔S-suffix styles (strongest "supersession" signal): ${pairs.length}`
    )
    for (const pair of pairs.slice(0, 20)) {
      logger.info(`[probe]   ${pair.base} ↔ ${pair.sCode}`)
    }
  } else {
    logger.info(
      "[probe] No paired base↔S-suffix styles found. The S suffix may be intrinsic to the styleCode for some product lines, not a discontinue marker."
    )
  }
}
