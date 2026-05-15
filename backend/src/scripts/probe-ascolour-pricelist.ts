import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"

/**
 * One-shot diagnostic for the AS Colour /catalog/pricelist endpoint.
 *
 * Background: the importer reads the pricelist into a Map<sku, price> with
 * last-write-wins semantics. If AS Colour returns multiple rows per SKU
 * (one per quantity-break tier), that map keeps a random tier per SKU
 * depending on page ordering — which is the suspected cause of inconsistent
 * variant retail prices on imported products.
 *
 * This probe fetches the full pricelist and prints:
 *   1. Keys present on the first entry (does AS Colour expose quantityFrom /
 *      quantityTo / tier / packSize?)
 *   2. Rows-per-SKU distribution (so we see 1 vs N rows per SKU)
 *   3. For one specific SKU (IMPORT_SKU env, optional), every matching row
 *      with every field
 *
 * Usage on Railway:
 *   cd /app/.medusa/server && IMPORT_SKU=<sku> npx medusa exec src/scripts/probe-ascolour-pricelist.js
 */
export default async function probeAsColourPricelist({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService

  const targetSku = process.env.IMPORT_SKU?.trim() || null

  logger.info("Fetching AS Colour pricelist (this walks every page)…")
  const entries = await ascolour.fetchAllPriceList()
  logger.info(`Total pricelist rows: ${entries.length}`)

  if (!entries.length) {
    logger.warn("Pricelist is empty. Nothing to analyse.")
    return
  }

  logger.info(`First entry keys: ${Object.keys(entries[0]).join(", ")}`)
  logger.info(`First entry: ${JSON.stringify(entries[0])}`)

  const rowsBySku = new Map<string, any[]>()
  for (const entry of entries) {
    const sku = (entry as any).sku
    if (!sku) continue
    const list = rowsBySku.get(sku) ?? []
    list.push(entry)
    rowsBySku.set(sku, list)
  }

  const counts = Array.from(rowsBySku.values()).map((rows) => rows.length)
  counts.sort((a, b) => a - b)
  const median = counts[Math.floor(counts.length / 2)] ?? 0
  const min = counts[0] ?? 0
  const max = counts[counts.length - 1] ?? 0

  logger.info(`Unique SKUs in pricelist: ${rowsBySku.size}`)
  logger.info(`Rows-per-SKU distribution: min=${min} median=${median} max=${max}`)

  const histogram = new Map<number, number>()
  for (const c of counts) {
    histogram.set(c, (histogram.get(c) ?? 0) + 1)
  }
  const histogramSorted = Array.from(histogram.entries()).sort((a, b) => a[0] - b[0])
  logger.info(
    `Rows-per-SKU histogram: ${histogramSorted
      .map(([rowCount, skuCount]) => `${rowCount}rows=${skuCount}skus`)
      .join(" ")}`
  )

  if (max === 1) {
    logger.warn(
      "All SKUs have exactly one pricelist row — no tier-selection bug is " +
        "possible. The retail-price variation seen in admin is a faithful " +
        "reflection of AS Colour's pricelist. Re-check the user's data " +
        "expectation."
    )
  } else {
    // Show a sample SKU that has the median count, so we see what the
    // distinguishing fields are.
    const sampleSku = Array.from(rowsBySku.entries()).find(
      ([, rows]) => rows.length === median
    )?.[0]
    if (sampleSku) {
      logger.info(
        `Sample SKU with median row count (${median}): ${sampleSku} — every row follows:`
      )
      for (const row of rowsBySku.get(sampleSku) ?? []) {
        logger.info(`  ${JSON.stringify(row)}`)
      }
    }
  }

  if (targetSku) {
    const rows = rowsBySku.get(targetSku)
    if (!rows) {
      logger.warn(`IMPORT_SKU=${targetSku} not present in pricelist.`)
    } else {
      logger.info(`IMPORT_SKU=${targetSku} has ${rows.length} pricelist row(s):`)
      for (const row of rows) {
        logger.info(`  ${JSON.stringify(row)}`)
      }
      const numericPrices = rows
        .map((r) => Number(r.price))
        .filter((n) => Number.isFinite(n))
      if (numericPrices.length) {
        const sorted = [...numericPrices].sort((a, b) => a - b)
        logger.info(
          `  → prices min=${sorted[0]} max=${sorted[sorted.length - 1]} (1-pack/single-unit = max)`
        )
      }
    }
  }
}
