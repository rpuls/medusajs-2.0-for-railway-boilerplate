import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BUNDLES_MODULE } from "../../../modules/bundles"
import type BundlesModuleService from "../../../modules/bundles/service"
import { slugifyBrandHandle } from "../../../lib/brand-handle"

const bundleBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  handle: z.string().trim().min(1).max(200).optional(),
  subtitle: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["active", "draft"]).optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  quantity_multiplier_label: z.string().trim().max(100).nullable().optional(),
  items: z
    .array(
      z.object({
        product_handle: z.string().trim().min(1),
        label: z.string().trim().min(1).max(200),
        quantity_per_unit: z.coerce.number().int().min(1).default(1),
        decoration_type: z
          .enum(["embroidery", "print", "none"])
          .default("embroidery"),
        position: z.coerce.number().int().min(0).default(0),
      })
    )
    .optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const [bundles] = await bundleService.listAndCountBundles(
    {},
    { order: { created_at: "DESC" } }
  )

  const [allItems] = await bundleService.listAndCountBundleItems(
    {},
    { order: { position: "ASC" } }
  )

  const itemsByBundle = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const existing = itemsByBundle.get(item.bundle_id) ?? []
    existing.push(item)
    itemsByBundle.set(item.bundle_id, existing)
  }

  const bundlesWithItems = bundles.map((b) => ({
    ...b,
    items: itemsByBundle.get(b.id) ?? [],
  }))

  res.json({ bundles: bundlesWithItems, count: bundles.length })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = bundleBodySchema.parse(req.body ?? {})
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const handle = body.handle?.trim() || slugifyBrandHandle(body.title)
  if (!handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Bundle handle could not be derived from title. Provide a handle explicitly."
    )
  }

  const [existing] = await bundleService.listAndCountBundles(
    { handle },
    { take: 1 }
  )
  if (existing.length > 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `A bundle with handle "${handle}" already exists.`
    )
  }

  const [created] = await bundleService.createBundles([
    {
      title: body.title,
      handle,
      subtitle: body.subtitle ?? null,
      status: body.status ?? "active",
      thumbnail_url: body.thumbnail_url ?? null,
      quantity_multiplier_label: body.quantity_multiplier_label ?? null,
    },
  ])

  if (body.items && body.items.length > 0) {
    await bundleService.createBundleItems(
      body.items.map((item, idx) => ({
        bundle_id: created.id,
        product_handle: item.product_handle,
        label: item.label,
        quantity_per_unit: item.quantity_per_unit,
        decoration_type: item.decoration_type,
        position: item.position ?? idx,
      }))
    )
  }

  const items = await bundleService.listBundleItems(
    { bundle_id: created.id },
    { order: { position: "ASC" } }
  )

  res.status(201).json({ bundle: { ...created, items } })
}
