import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { ulid } from "ulid"

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  mime_type: z.string().min(1).max(80),
  data_base64: z.string().min(1),
  caption: z.string().max(500).optional(),
})

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB — phone photo ceiling

type ProductionPhoto = {
  id: string
  url: string
  filename: string
  mime_type: string
  caption?: string | null
  uploaded_at: string
  uploaded_by?: string | null
}

/**
 * POST /admin/orders/:id/production-photos
 *   body: { filename, mime_type, data_base64, caption? }
 *   → { photo: ProductionPhoto, photos: ProductionPhoto[] }
 *
 * Uploads a photo to MinIO via the standard file module, then stamps
 * the resulting URL onto `order.metadata.production_photos[]`.
 *
 * The next `order.production_stage_changed` email picks up the latest
 * photo automatically (see `order-production-stage.tsx`). Useful for
 * "your job is on the press right now" updates.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  if (!orderId) return res.status(400).json({ error: "id required" })

  let parsed: z.infer<typeof uploadSchema>
  try {
    parsed = uploadSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Invalid request" })
  }

  // Strip a `data:<mime>;base64,` prefix if present.
  const base64 = parsed.data_base64.replace(/^data:[^;]+;base64,/, "")
  let buffer: Buffer
  try {
    buffer = Buffer.from(base64, "base64")
  } catch {
    return res.status(400).json({ error: "data_base64 is not valid base64" })
  }
  if (buffer.byteLength === 0) {
    return res.status(400).json({ error: "Empty payload" })
  }
  if (buffer.byteLength > MAX_BYTES) {
    return res.status(413).json({ error: "File exceeds 8 MB limit" })
  }
  if (!parsed.mime_type.startsWith("image/")) {
    return res.status(400).json({ error: "Only image uploads are accepted" })
  }

  const fileModuleService = req.scope.resolve(Modules.FILE) as unknown as {
    createFiles: (
      data:
        | { filename: string; mimeType: string; content: string }
        | { filename: string; mimeType: string; content: string }[]
    ) => Promise<Array<{ id: string; url: string }>>
  }

  const safeName = `production-photos/${orderId}/${Date.now()}-${parsed.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  let uploaded: Array<{ id: string; url: string }>
  try {
    uploaded = await fileModuleService.createFiles([
      {
        filename: safeName,
        mimeType: parsed.mime_type,
        content: base64,
      },
    ])
  } catch (err: any) {
    return res.status(500).json({
      error: "Upload failed",
      detail: String(err?.message ?? err),
    })
  }
  if (!uploaded?.[0]?.url) {
    return res.status(500).json({ error: "Upload returned no URL" })
  }

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "Order not found" })
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const existing = Array.isArray(meta.production_photos)
    ? (meta.production_photos as ProductionPhoto[])
    : []

  const photo: ProductionPhoto = {
    id: ulid(),
    url: uploaded[0].url,
    filename: parsed.filename,
    mime_type: parsed.mime_type,
    caption: parsed.caption ?? null,
    uploaded_at: new Date().toISOString(),
    uploaded_by: (req as any).auth_context?.actor_id ?? null,
  }

  const photos = [...existing, photo]
  await orderModuleService.updateOrders(orderId, {
    metadata: { ...meta, production_photos: photos },
  })

  res.status(201).json({ photo, photos })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "Order not found" })
  }
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const photos = Array.isArray(meta.production_photos)
    ? (meta.production_photos as ProductionPhoto[])
    : []
  res.json({ photos })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const photoId = String((req.query?.id as string) ?? "")
  if (!photoId) return res.status(400).json({ error: "id query param required" })

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "Order not found" })
  }
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const photos = Array.isArray(meta.production_photos)
    ? (meta.production_photos as ProductionPhoto[])
    : []
  const next = photos.filter((p) => p?.id !== photoId)
  await orderModuleService.updateOrders(orderId, {
    metadata: { ...meta, production_photos: next },
  })
  res.json({ photos: next })
}
