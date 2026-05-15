import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ulid } from "ulid"
import { z } from "zod"

import { LOOKBOOK_MODULE } from "../../../modules/lookbook"
import type LookbookModuleService from "../../../modules/lookbook/service"

const MAX_BYTES = 8 * 1024 * 1024

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  /** Either a pre-uploaded URL or a base64 data URL. */
  image_url: z.string().min(1).optional(),
  image_data_base64: z.string().optional(),
  image_filename: z.string().max(200).optional(),
  image_mime_type: z.string().max(80).optional(),
  attribution: z.string().max(200).optional(),
  order_id: z.string().max(120).optional(),
  product_ids: z.array(z.string()).max(20).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  is_published: z.boolean().optional(),
  weight: z.coerce.number().int().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const includeUnpublished =
    String(req.query.include_unpublished ?? "").toLowerCase() === "true"
  const service = req.scope.resolve<LookbookModuleService>(LOOKBOOK_MODULE)
  const items = await service.listLookbookItems(
    includeUnpublished ? {} : { is_published: true },
    { order: { weight: "ASC" }, take: 500 }
  )
  res.json({ items })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  let imageUrl = body.image_url
  // If staff pasted a base64 data URL, push it through the file module.
  if (!imageUrl && body.image_data_base64) {
    try {
      const fileModuleService = req.scope.resolve(Modules.FILE) as any
      const base64 = body.image_data_base64.replace(/^data:[^;]+;base64,/, "")
      const buf = Buffer.from(base64, "base64")
      if (buf.byteLength > MAX_BYTES) {
        return res.status(413).json({ error: "image exceeds 8 MB" })
      }
      const filename = `lookbook/${ulid()}-${(body.image_filename ?? "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "_")}`
      const [uploaded] = await fileModuleService.createFiles([
        {
          filename,
          mimeType: body.image_mime_type ?? "image/jpeg",
          content: base64,
        },
      ])
      imageUrl = uploaded?.url
    } catch (err: any) {
      return res.status(500).json({ error: "upload_failed", detail: err?.message })
    }
  }

  if (!imageUrl) {
    return res.status(400).json({ error: "image_url or image_data_base64 required" })
  }

  const service = req.scope.resolve<LookbookModuleService>(LOOKBOOK_MODULE)
  const [created] = await service.createLookbookItems([
    {
      title: body.title,
      description: body.description ?? null,
      image_url: imageUrl,
      attribution: body.attribution ?? null,
      order_id: body.order_id ?? null,
      product_ids: { ids: body.product_ids ?? [] },
      tags: { values: body.tags ?? [] },
      is_published: body.is_published ?? true,
      weight: body.weight ?? 0,
      created_by: (req as any).auth_context?.actor_id ?? null,
    },
  ])

  res.status(201).json({ item: created })
}
