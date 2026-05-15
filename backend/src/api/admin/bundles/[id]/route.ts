import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BUNDLES_MODULE } from "../../../../modules/bundles"
import type BundlesModuleService from "../../../../modules/bundles/service"

const paramsSchema = z.object({ id: z.string().min(1) })

const updateBodySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
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
  const { id } = paramsSchema.parse(req.params ?? {})
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const bundle = await bundleService.retrieveBundle(id).catch(() => null)
  if (!bundle) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bundle "${id}" not found.`
    )
  }

  const items = await bundleService.listBundleItems(
    { bundle_id: id },
    { order: { position: "ASC" } }
  )

  res.json({ bundle: { ...bundle, items } })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const body = updateBodySchema.parse(req.body ?? {})
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const existing = await bundleService.retrieveBundle(id).catch(() => null)
  if (!existing) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bundle "${id}" not found.`
    )
  }

  const patch: Record<string, unknown> = {}
  if (body.title !== undefined) patch.title = body.title
  if (body.handle !== undefined) patch.handle = body.handle
  if (body.subtitle !== undefined) patch.subtitle = body.subtitle
  if (body.status !== undefined) patch.status = body.status
  if (body.thumbnail_url !== undefined)
    patch.thumbnail_url = body.thumbnail_url
  if (body.quantity_multiplier_label !== undefined)
    patch.quantity_multiplier_label = body.quantity_multiplier_label

  if (Object.keys(patch).length > 0) {
    await bundleService.updateBundles({ id, ...patch })
  }

  if (body.items !== undefined) {
    const existingItems = await bundleService.listBundleItems({ bundle_id: id })
    if (existingItems.length > 0) {
      await bundleService.deleteBundleItems(existingItems.map((i) => i.id))
    }
    if (body.items.length > 0) {
      await bundleService.createBundleItems(
        body.items.map((item, idx) => ({
          bundle_id: id,
          product_handle: item.product_handle,
          label: item.label,
          quantity_per_unit: item.quantity_per_unit,
          decoration_type: item.decoration_type,
          position: item.position ?? idx,
        }))
      )
    }
  }

  const updated = await bundleService.retrieveBundle(id)
  const items = await bundleService.listBundleItems(
    { bundle_id: id },
    { order: { position: "ASC" } }
  )

  res.json({ bundle: { ...updated, items } })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const existing = await bundleService.retrieveBundle(id).catch(() => null)
  if (!existing) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bundle "${id}" not found.`
    )
  }

  await bundleService.deleteBundles(id)
  res.json({ id, object: "bundle", deleted: true })
}
