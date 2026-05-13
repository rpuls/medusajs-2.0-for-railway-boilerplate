import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"

/**
 * Read-only inventory diagnostic. AS Colour reports 10k+ units in stock
 * for a black Parcel Tote 1000 on their public site, but Medusa
 * inventory_levels for the 5 imported AS Colour products all show 0.
 * 12+ hours have passed since import so the hourly cron has had many
 * chances to populate.
 *
 * This script:
 *  1) Calls fetchInventoryDelta() with NO checkpoint (== full sweep,
 *     same call the import-time seed makes).
 *  2) Reports how many items came back and the first 10 SKUs.
 *  3) Specifically searches for SKUs starting with each AS Colour
 *     style code we imported (1000, 1001, 1002, 1003, 1004) to see
 *     the actual shape AS Colour returns them in.
 *  4) Compares against what Medusa has in inventory_item.sku for
 *     those style codes — so we can spot any mismatch.
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/probe-ascolour-inventory.js
 */
export default async function probeAsColourInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  let ascolour: AsColourService
  try {
    ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch (e: any) {
    logger.error(`AS Colour module not registered: ${e?.message ?? e}`)
    return
  }

  // 1) Full inventory sweep
  logger.info("Calling fetchInventoryDelta() with no checkpoint (full sweep)…")
  let items: any[] = []
  try {
    items = await ascolour.fetchInventoryDelta()
  } catch (e: any) {
    logger.error(`fetchInventoryDelta failed: ${e?.message ?? e}`)
    logger.error(`stack: ${e?.stack ?? "(no stack)"}`)
    return
  }
  logger.info(`fetchInventoryDelta returned ${items.length} items.`)

  if (!items.length) {
    logger.warn(
      "Zero items returned — the API may be rejecting our request or the endpoint behaves differently without a checkpoint."
    )
    return
  }

  // 2) First 10 items, full shape
  logger.info("First 10 items (full JSON, to show the actual response shape):")
  for (const it of items.slice(0, 10)) {
    logger.info(`  ${JSON.stringify(it)}`)
  }

  // 3) Pull out unique SKU prefixes (first 4 chars) to see what style codes
  //    AS Colour is returning inventory for.
  const stylePrefixCounts = new Map<string, number>()
  for (const it of items) {
    if (!it?.sku) continue
    const prefix = String(it.sku).slice(0, 4)
    stylePrefixCounts.set(prefix, (stylePrefixCounts.get(prefix) ?? 0) + 1)
  }
  const sortedPrefixes = Array.from(stylePrefixCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )
  logger.info(`Unique 4-char SKU prefixes (top 20):`)
  for (const [prefix, count] of sortedPrefixes.slice(0, 20)) {
    logger.info(`  ${prefix} → ${count} variants`)
  }

  // 4) Per imported style code, dump what AS Colour returned vs what Medusa has
  const targetStyles = ["1000", "1001", "1002", "1003", "1004"]
  for (const styleCode of targetStyles) {
    logger.info(`---`)
    logger.info(`Style ${styleCode}:`)

    const ascSkus = items
      .filter((it: any) =>
        typeof it?.sku === "string" && it.sku.startsWith(styleCode)
      )
      .map((it: any) => ({
        sku: it.sku,
        warehouses: it.warehouses,
        available: it.available,
      }))
    logger.info(`  AS Colour API returned ${ascSkus.length} matching SKUs`)
    for (const s of ascSkus.slice(0, 5)) {
      const wh = (s.warehouses ?? [])
        .map((w: any) => `${w.warehouse}=${w.available}`)
        .join(", ")
      logger.info(
        `    asc.sku=${s.sku} available=${s.available ?? "n/a"} warehouses=[${wh}]`
      )
    }

    // What Medusa has in inventory_item for this style
    const medusaRows = await pg("inventory_item")
      .select("id", "sku")
      .whereRaw("sku LIKE ?", [`${styleCode}-%`])
      .orderBy("sku")
    logger.info(`  Medusa inventory_item rows: ${medusaRows.length}`)
    for (const r of medusaRows.slice(0, 5)) {
      logger.info(`    medusa.sku=${r.sku}`)
    }

    // Compute set diff
    const ascSet = new Set(ascSkus.map((s: any) => s.sku))
    const medusaSet = new Set(medusaRows.map((r: any) => r.sku))
    const inBoth = [...ascSet].filter((s: any) => medusaSet.has(s))
    const onlyAsc = [...ascSet].filter((s: any) => !medusaSet.has(s))
    const onlyMedusa = [...medusaSet].filter((s: any) => !ascSet.has(s))
    logger.info(
      `  ✓ in both: ${inBoth.length}  | only in AS Colour: ${onlyAsc.length}  | only in Medusa: ${onlyMedusa.length}`
    )
    if (onlyMedusa.length) {
      logger.info(`    ❗ Medusa SKUs NOT in AS Colour inventory response:`)
      for (const s of onlyMedusa.slice(0, 5)) {
        logger.info(`      ${s}`)
      }
    }
    if (onlyAsc.length) {
      logger.info(`    AS Colour SKUs not in our Medusa inventory:`)
      for (const s of onlyAsc.slice(0, 5)) {
        logger.info(`      ${s}`)
      }
    }
  }

  logger.info("Done (read-only).")
}
