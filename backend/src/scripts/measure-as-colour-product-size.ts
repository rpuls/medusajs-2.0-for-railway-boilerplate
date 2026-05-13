import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Read-only: measure the serialized JSON size of an AS Colour product
 * fetched the same way the storefront fetches it (same field expansion).
 * Helps locate which field is responsible for blowing past Vercel's 1MB
 * RSC payload limit on the PDP.
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/measure-as-colour-product-size.js
 */
export default async function measureAsColourProductSize({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // Mikro-ORM blows up on wildcard expansion of computed fields like
  // `calculated_price` (it tries to traverse the property descriptor),
  // so list real fields explicitly. This is close enough to what the
  // storefront fetches (STORE_PRODUCT_FIELDS in
  // storefront/src/lib/data/products.ts:37) to see where the bloat lives.
  const fields = [
    "id",
    "handle",
    "title",
    "subtitle",
    "description",
    "material",
    "thumbnail",
    "status",
    "metadata",
    "weight",
    "type.*",
    "tags.*",
    "brand.*",
    "images.*",
    "options.*",
    "options.values.*",
    "variants.id",
    "variants.sku",
    "variants.title",
    "variants.barcode",
    "variants.weight",
    "variants.metadata",
    "variants.options.*",
  ]

  const { data: products } = await query.graph({
    entity: "product",
    fields,
    filters: {
      handle: [
        "as-colour-1000-1000",
        "as-colour-1001-1001",
        "as-colour-1002-1002",
        "as-colour-1003-1003",
        "as-colour-1004-1004",
      ],
    },
  })

  logger.info(`Fetched ${products.length} products`)

  for (const p of products as any[]) {
    const fullJson = JSON.stringify(p)
    const fullSize = Buffer.byteLength(fullJson, "utf8")
    logger.info(`---`)
    logger.info(
      `handle=${p.handle} title="${p.title}" → total serialized size: ${(fullSize / 1024).toFixed(1)} KB (${fullSize} bytes)`
    )

    // Break down per top-level key so we know which field is the bloat
    const breakdown: Array<{ key: string; bytes: number }> = []
    for (const key of Object.keys(p)) {
      try {
        const bytes = Buffer.byteLength(JSON.stringify((p as any)[key] ?? null), "utf8")
        breakdown.push({ key, bytes })
      } catch {
        breakdown.push({ key, bytes: -1 })
      }
    }
    breakdown.sort((a, b) => b.bytes - a.bytes)
    const top = breakdown.slice(0, 10)
    for (const b of top) {
      logger.info(`    ${b.key.padEnd(28)} ${(b.bytes / 1024).toFixed(2)} KB`)
    }

    // Special-case the most common bloat suspects
    if (Array.isArray(p.variants)) {
      const variantCount = p.variants.length
      const variantsSize = Buffer.byteLength(
        JSON.stringify(p.variants),
        "utf8"
      )
      logger.info(
        `    └ variants[${variantCount}] avg ${(variantsSize / variantCount / 1024).toFixed(2)} KB each`
      )
      // Inspect first variant in detail
      if (p.variants[0]) {
        const v = p.variants[0]
        for (const vk of Object.keys(v)) {
          const vBytes = Buffer.byteLength(
            JSON.stringify((v as any)[vk] ?? null),
            "utf8"
          )
          if (vBytes > 500) {
            logger.info(`      v[0].${vk.padEnd(24)} ${(vBytes / 1024).toFixed(2)} KB`)
          }
        }
      }
    }
  }

  logger.info("Done (read-only).")
}
