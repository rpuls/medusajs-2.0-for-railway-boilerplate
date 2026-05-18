import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
  QueryContext,
} from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../../../modules/brand"
import type BrandModuleService from "../../../../../modules/brand/service"

const paramsSchema = z.object({ handle: z.string().min(1) })

const arrayString = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (Array.isArray(v) ? v : [v]))
  .optional()

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  offset: z.coerce.number().int().min(0).optional().default(0),
  order: z.string().optional(),
  region_id: z.string().optional(),
  type_id: arrayString,
  tag_id: arrayString,
})

const STORE_PRODUCT_FIELDS = [
  "id",
  "title",
  "subtitle",
  "description",
  "handle",
  "is_giftcard",
  "discountable",
  "thumbnail",
  "collection_id",
  "type_id",
  "weight",
  "created_at",
  "updated_at",
  "metadata",
  "type.*",
  "collection.*",
  "options.*",
  "options.values.*",
  "tags.*",
  "images.*",
  "variants.*",
  "variants.options.*",
  "variants.calculated_price.*",
  "variants.inventory_quantity",
  "variants.metadata",
  "variants.sku",
  "variants.weight",
  "variants.manage_inventory",
  "variants.allow_backorder",
  "brand.*",
]

// Handle prefix → brand handle. Used as a fallback when the Module Link table is missing
// rows (the legacy import scripts created products correctly but the link.create() calls
// have proven fragile in production). Kept in sync with relink-supplier-brands.ts and
// verify-brand-links.ts. This is a CONFIG-driven fallback (not a parallel data store) —
// product.handle is the same source of truth used everywhere; we're only filtering by
// its known prefix when the link table happens to be empty.
const HANDLE_PREFIX_BY_BRAND_HANDLE: Record<string, string> = {
  "as-colour": "as-colour-",
  syzmik: "syzmik-",
  "biz-collection": "biz-collection-",
  "biz-care": "biz-care-",
  "biz-corporates": "biz-corporates-",
  "aussie-pacific": "aussie-pacific-",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = paramsSchema.parse(req.params ?? {})
  const q = querySchema.parse(req.query ?? {})

  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const pgConnection = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION
  ) as any
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as any

  const [brands] = await brandService.listAndCountBrands(
    { handle, is_active: true },
    { take: 1 }
  )
  const brand = brands[0]
  if (!brand) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Brand "${handle}" not found.`
    )
  }

  // Primary path: read product IDs from the Module Link table via Knex. Same source of
  // truth as the previous working deploy; just used inside our paginated route now so
  // the IDs never cross the wire to the client.
  const linkRows: Array<{ product_id: string }> = await pgConnection(
    "product_product_brand_brand"
  )
    .where({ brand_id: brand.id })
    .whereNull("deleted_at")
    .select("product_id")

  let brandProductIds: string[] = linkRows
    .map((r) => r?.product_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)

  // Fallback: if the link table is empty for this brand, derive membership from the
  // product handle prefix (e.g. as-colour-*). Brand handles match prefixes by import
  // convention, so this gives correct results while the link table is being repaired.
  // Logs a WARN so the drift is visible — does NOT silently mask it.
  if (brandProductIds.length === 0) {
    const prefix = HANDLE_PREFIX_BY_BRAND_HANDLE[brand.handle]
    if (prefix) {
      const prefixRes = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle: { $like: `${prefix}%` } },
        pagination: { take: 10_000, skip: 0 },
      })
      brandProductIds = ((prefixRes.data ?? []) as Array<{ id?: string }>)
        .map((p) => p.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
      if (brandProductIds.length > 0) {
        logger.warn(
          `[brand-products] Link table is empty for brand "${brand.handle}" (id=${brand.id}). ` +
            `Falling back to handle-prefix match — found ${brandProductIds.length} product(s) with prefix "${prefix}". ` +
            `Run relink-supplier-brands to repair the link table.`
        )
      }
    }
  }

  if (brandProductIds.length === 0) {
    res.json({
      products: [],
      count: 0,
      offset: q.offset,
      limit: q.limit,
    })
    return
  }

  const filters: Record<string, any> = {
    id: brandProductIds,
    status: ProductStatus.PUBLISHED,
  }
  if (q.type_id?.length) {
    filters.type_id = q.type_id
  }
  if (q.tag_id?.length) {
    filters.tags = { id: q.tag_id }
  }

  const salesChannelIds: string[] | undefined = (req as any)
    .publishable_key_context?.sales_channel_ids
  if (Array.isArray(salesChannelIds) && salesChannelIds.length) {
    filters.sales_channels = { id: salesChannelIds }
  }

  const context: Record<string, any> = {}
  if (q.region_id) {
    const regionRes = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: { id: q.region_id },
      pagination: { take: 1, skip: 0 },
    })
    const region = (regionRes.data ?? [])[0]
    if (region) {
      context.variants = {
        calculated_price: QueryContext({
          region_id: region.id,
          currency_code: region.currency_code,
        }),
      }
    }
  }

  let orderConfig: Record<string, "ASC" | "DESC"> | undefined
  if (q.order) {
    const desc = q.order.startsWith("-")
    const field = desc ? q.order.slice(1) : q.order
    if (field) {
      orderConfig = { [field]: desc ? "DESC" : "ASC" }
    }
  }

  const { data: products, metadata } = await query.graph({
    entity: "product",
    fields: STORE_PRODUCT_FIELDS,
    filters,
    pagination: {
      take: q.limit,
      skip: q.offset,
      ...(orderConfig ? { order: orderConfig } : {}),
    },
    context,
  })

  // AP products store every variant image at the product level (~60 images per
  // style) because the AP API nests images per variant. Listing cards don't need
  // product.images — they read garment_images.front from variant metadata.
  // Strip the array here so the listing payload isn't 10× larger than other brands.
  // The PDP uses a different route and still receives the full image gallery.
  const trimmedProducts = (products ?? []).map((p: any) => {
    if (p.metadata?.source === "aussiepacific") {
      return { ...p, images: [] }
    }
    return p
  })

  res.json({
    products: trimmedProducts,
    count: metadata?.count ?? 0,
    offset: q.offset,
    limit: q.limit,
  })
}
