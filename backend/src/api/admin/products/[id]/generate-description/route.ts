import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

import { generateProductDescriptions } from "../../../../../services/ai-copy/generate"
import type { ProductContext } from "../../../../../services/ai-copy/prompt"

const SAFE_METADATA_KEYS = [
  "fabric_blend",
  "fabric",
  "gsm",
  "fit",
  "neckline",
  "season",
  "country_of_origin",
  "care_instructions",
  "decoration_methods",
] as const

const generateSchema = z.object({
  /** Optional hint to bias the model — e.g. "winter, casual",
   *  "performance team kit", etc. */
  hint: z.string().max(200).optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.params.id
  if (!productId) {
    return res.status(400).json({ error: "id required" })
  }

  // Parse body but tolerate missing — it's all optional.
  let body: z.infer<typeof generateSchema> = {}
  try {
    body = generateSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "weight",
      "metadata",
      "type.value",
      "tags.value",
      "variants.title",
      "brand.name",
      "brand.handle",
    ],
    filters: { id: productId },
  })
  const product = (products as any[])?.[0]
  if (!product) {
    return res.status(404).json({ error: "product_not_found" })
  }

  if (!product.title || String(product.title).trim().length === 0) {
    return res.status(400).json({
      error: "product_missing_title",
      detail:
        "Product needs a title before an AI description can be generated.",
    })
  }

  // Extract only the metadata keys we consider safe to send to an LLM.
  const rawMeta = (product.metadata as Record<string, unknown> | undefined) ?? {}
  const safeMeta: Record<string, string | number | boolean | null> = {}
  for (const k of SAFE_METADATA_KEYS) {
    const v = rawMeta[k]
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      safeMeta[k] = v
    }
  }
  if (body.hint) safeMeta.hint = body.hint.trim()

  const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
  const ctx: ProductContext = {
    title: String(product.title),
    handle: typeof product.handle === "string" ? product.handle : null,
    brand_name: brand?.name ?? null,
    brand_handle: brand?.handle ?? null,
    description_current: typeof product.description === "string" ? product.description : null,
    type_value:
      typeof product.type?.value === "string" ? product.type.value : null,
    weight_grams:
      typeof product.weight === "number" && product.weight > 0
        ? product.weight
        : null,
    tags: Array.isArray(product.tags)
      ? product.tags
          .map((t: any) => (typeof t?.value === "string" ? t.value : null))
          .filter((v: any): v is string => typeof v === "string")
      : null,
    variant_titles: Array.isArray(product.variants)
      ? product.variants
          .map((v: any) => (typeof v?.title === "string" ? v.title : null))
          .filter((v: any): v is string => typeof v === "string")
      : null,
    safe_metadata: safeMeta,
  }

  const result = await generateProductDescriptions(ctx)

  if (result.ok === false) {
    const statusMap = {
      not_configured: 503,
      timeout: 504,
      rate_limited: 429,
      upstream: 502,
      empty: 502,
    } as const
    return res.status(statusMap[result.error]).json({
      error: result.error,
      detail: result.detail ?? null,
    })
  }

  res.json({
    drafts: result.drafts,
    provider: result.provider,
    model: result.model,
  })
}
