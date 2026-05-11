import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../../modules/brand"
import type BrandModuleService from "../../../../modules/brand/service"

const paramsSchema = z.object({ id: z.string().min(1) })

const updateBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  handle: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  external_code: z.string().trim().min(1).max(60).nullable().optional(),
  parent_id: z.string().min(1).nullable().optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
  const brand = await brandService.retrieveBrand(id).catch(() => null)
  if (!brand) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${id}" not found.`)
  }
  res.json({ brand })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const body = updateBodySchema.parse(req.body ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  const existing = await brandService.retrieveBrand(id).catch(() => null)
  if (!existing) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${id}" not found.`)
  }

  if (body.parent_id !== undefined && body.parent_id !== null) {
    if (body.parent_id === id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A brand cannot be its own parent."
      )
    }
    const parent = await brandService.retrieveBrand(body.parent_id).catch(() => null)
    if (!parent) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Parent brand "${body.parent_id}" not found.`
      )
    }
    if (parent.parent_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Only one level of brand nesting is supported (parent cannot itself have a parent)."
      )
    }
    // If this brand is itself a parent (has children), it cannot also become a child.
    const [children] = await brandService.listAndCountBrands(
      { parent_id: id },
      { take: 1 }
    )
    if (children.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This brand has child brands; reparent or detach them before assigning a parent."
      )
    }
  }

  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.handle !== undefined) patch.handle = body.handle
  if (body.description !== undefined) patch.description = body.description
  if (body.logo_url !== undefined) patch.logo_url = body.logo_url
  if (body.external_code !== undefined) patch.external_code = body.external_code
  if (body.parent_id !== undefined) patch.parent_id = body.parent_id
  if (body.is_active !== undefined) patch.is_active = body.is_active
  if (body.metadata !== undefined) patch.metadata = body.metadata

  await brandService.updateBrands({ id, ...patch })
  const updated = await brandService.retrieveBrand(id)
  res.json({ brand: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  const [children] = await brandService.listAndCountBrands(
    { parent_id: id },
    { take: 1 }
  )
  if (children.length > 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cannot delete a brand that has child brands. Reparent or delete the children first."
    )
  }

  await brandService.deleteBrands(id)
  res.json({ id, object: "brand", deleted: true })
}
