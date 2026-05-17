import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { ulid } from "ulid"

const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  mime_type: z.string().min(1).max(80),
  data_base64: z.string().min(1),
  note: z.string().max(500).optional(),
})

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

export type RevisedProof = {
  id: string
  url: string
  filename: string
  mime_type: string
  note?: string | null
  uploaded_at: string
  uploaded_by?: string | null
}

/**
 * POST /admin/orders/:id/revised-proof
 *   body: { filename, mime_type, data_base64, note? }
 *   → { proof: RevisedProof, proofs: RevisedProof[] }
 *
 * Uploads a revised artwork proof to MinIO, then appends the URL to
 * `order.metadata.revised_proofs[]`. The most recent entry is shown
 * on the customer's approval page instead of the auto-generated mockups.
 *
 * GET  → { proofs: RevisedProof[] }
 * DELETE ?id=<proofId> → { proofs: RevisedProof[] }
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
      data: { filename: string; mimeType: string; content: string }[]
    ) => Promise<Array<{ id: string; url: string }>>
  }

  const safeName = `revised-proofs/${orderId}/${Date.now()}-${parsed.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  let uploaded: Array<{ id: string; url: string }>
  try {
    uploaded = await fileModuleService.createFiles([
      { filename: safeName, mimeType: parsed.mime_type, content: base64 },
    ])
  } catch (err: any) {
    return res.status(500).json({ error: "Upload failed", detail: String(err?.message ?? err) })
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
  const existing: RevisedProof[] = Array.isArray(meta.revised_proofs)
    ? (meta.revised_proofs as RevisedProof[])
    : []

  const proof: RevisedProof = {
    id: ulid(),
    url: uploaded[0].url,
    filename: parsed.filename,
    mime_type: parsed.mime_type,
    note: parsed.note ?? null,
    uploaded_at: new Date().toISOString(),
    uploaded_by: (req as any).auth_context?.actor_id ?? null,
  }

  const proofs = [...existing, proof]
  await orderModuleService.updateOrders(orderId, {
    metadata: { ...meta, revised_proofs: proofs },
  })

  res.status(201).json({ proof, proofs })
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
  const proofs: RevisedProof[] = Array.isArray(meta.revised_proofs)
    ? (meta.revised_proofs as RevisedProof[])
    : []
  res.json({ proofs })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const proofId = String((req.query?.id as string) ?? "")
  if (!proofId) return res.status(400).json({ error: "id query param required" })

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "Order not found" })
  }
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const proofs: RevisedProof[] = Array.isArray(meta.revised_proofs)
    ? (meta.revised_proofs as RevisedProof[])
    : []
  const next = proofs.filter((p) => p?.id !== proofId)
  await orderModuleService.updateOrders(orderId, {
    metadata: { ...meta, revised_proofs: next },
  })
  res.json({ proofs: next })
}
