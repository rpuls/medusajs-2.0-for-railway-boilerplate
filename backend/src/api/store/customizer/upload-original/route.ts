import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { uploadCustomerOriginalFile } from "../../../../services/customizer-render/upload-original-storage"
import { getPostHog } from "../../../../lib/posthog"

const bodySchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(["image/png", "image/jpeg", "image/svg+xml"]),
  /** Raw file bytes, base64-encoded (exact upload; not re-encoded server-side). */
  dataBase64: z.string().min(1),
})

/**
 * POST /store/customizer/upload-original
 * Stores the customer's uploaded image/SVG unchanged on object storage; returns a public URL for cart metadata.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = bodySchema.safeParse(req.body ?? {})

  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid upload-original payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`
    )
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(parsed.data.dataBase64, "base64")
  } catch {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid base64 payload.")
  }

  const url = await uploadCustomerOriginalFile(buffer, parsed.data.mimeType, parsed.data.fileName)
  if (!url) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "File storage is not configured (MinIO / S3 env missing). Customer originals cannot be archived."
    )
  }
  const distinctId = (req as any).auth_context?.actor_id ?? "anonymous"
  getPostHog()?.capture({
    distinctId,
    event: "original file uploaded",
    properties: {
      file_name: parsed.data.fileName,
      mime_type: parsed.data.mimeType,
      bytes: buffer.length,
    },
  })

  return res.status(200).json({
    success: true,
    url,
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    bytes: buffer.length,
  })
}
