/**
 * Pure prompt-builder for AI product description generation. Lives
 * apart from any HTTP / provider concerns so it can be unit-tested
 * with literal inputs.
 *
 * Design notes:
 *   - Truncate long lists (variants, tags) so context stays small —
 *     LLMs charge by token and we don't need every variant detail
 *     to write a good description.
 *   - Avoid leaking metadata that's not on the page (sku, prices) —
 *     descriptions shouldn't mention sku numbers and pricing changes
 *     over time.
 *   - Force the model to produce 2-3 distinct drafts so the operator
 *     has a real choice.
 *   - Constrain output to safe-for-storefront plain text (no HTML),
 *     <= ~600 characters per draft.
 *   - Include SC PRINTS brand voice cues so output stays on-brand.
 */

const BRAND_VOICE = `Tone: direct, warm, practical. Australian English. No hype, no buzzwords,
no superlatives ("ultimate", "premium" only when factually justified).
Focus on what the garment actually does for the customer. Mention fabric
weight, fit, and decoration suitability when known.`

const MAX_VARIANT_LIST = 8
const MAX_TAGS = 12

export type ProductContext = {
  title: string
  handle?: string | null
  brand_name?: string | null
  brand_handle?: string | null
  description_current?: string | null
  type_value?: string | null
  weight_grams?: number | null
  tags?: string[] | null
  variant_titles?: string[] | null
  /** Optional metadata.key:value pairs that staff have already typed.
   *  Useful for things like fabric_blend, gsm, fit. Limited to known-
   *  safe keys to avoid leaking pricing-sensitive data into prompts. */
  safe_metadata?: Record<string, string | number | boolean | null> | null
}

const dedupe = (xs: string[]): string[] =>
  Array.from(new Set(xs.map((s) => s.trim()).filter((s) => s.length > 0)))

const truncate = (s: string, max = 400): string =>
  s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`

/**
 * Returns the structured prompt parts (system + user) for the LLM.
 * Caller adapts these to whichever provider's API shape it uses.
 */
export function buildProductDescriptionPrompt(ctx: ProductContext): {
  system: string
  user: string
} {
  if (!ctx?.title || !ctx.title.trim()) {
    throw new Error("Product title is required to build a prompt.")
  }

  const lines: string[] = []
  lines.push(`Product title: ${ctx.title.trim()}`)
  if (ctx.brand_name?.trim()) {
    lines.push(`Brand: ${ctx.brand_name.trim()}`)
  }
  if (ctx.type_value?.trim()) {
    lines.push(`Garment type: ${ctx.type_value.trim()}`)
  }
  if (typeof ctx.weight_grams === "number" && ctx.weight_grams > 0) {
    lines.push(`Garment weight: ${ctx.weight_grams}g`)
  }
  if (ctx.tags && ctx.tags.length > 0) {
    const tags = dedupe(ctx.tags).slice(0, MAX_TAGS)
    lines.push(`Tags: ${tags.join(", ")}`)
  }
  if (ctx.variant_titles && ctx.variant_titles.length > 0) {
    const variants = dedupe(ctx.variant_titles).slice(0, MAX_VARIANT_LIST)
    lines.push(
      `Available variants (sample of ${ctx.variant_titles.length}): ${variants.join("; ")}`
    )
  }
  if (ctx.safe_metadata && Object.keys(ctx.safe_metadata).length > 0) {
    const safeEntries = Object.entries(ctx.safe_metadata)
      .filter(
        ([, v]) =>
          v !== null && v !== undefined && String(v).trim().length > 0
      )
      .slice(0, 12)
    if (safeEntries.length > 0) {
      lines.push(
        `Additional facts: ${safeEntries
          .map(([k, v]) => `${k}=${String(v)}`)
          .join("; ")}`
      )
    }
  }
  if (ctx.description_current?.trim()) {
    lines.push(`Current description (rewrite, don't copy):`)
    lines.push(truncate(ctx.description_current.trim(), 600))
  }

  const userPrompt = [
    `Write product descriptions for an SC PRINTS apparel listing.`,
    "",
    `Inputs:`,
    ...lines.map((l) => `- ${l}`),
    "",
    `Constraints:`,
    `- Produce exactly 3 distinct drafts ranging from short (1 sentence, ~140 chars) to long (3 short paragraphs, ~600 chars).`,
    `- Plain text only. No markdown, no HTML, no bullet points, no emoji.`,
    `- Do not invent fabric percentages, certifications, or sizes that aren't in the inputs.`,
    `- Mention decoration suitability (screen print, embroidery, DTF) only if the brand or type suggests it.`,
    `- Do not include the product title or brand name verbatim more than once per draft.`,
    `- Do not mention prices, SKUs, or stock levels.`,
    "",
    `Brand voice:`,
    BRAND_VOICE,
    "",
    `Return STRICT JSON with this shape:`,
    `{"drafts": [{"label": "Short", "body": "..."}, {"label": "Standard", "body": "..."}, {"label": "Detailed", "body": "..."}]}`,
  ].join("\n")

  const systemPrompt = `You are a copywriter for an Australian custom-print apparel shop. Output strict JSON only — no preamble, no postscript.`

  return { system: systemPrompt, user: userPrompt }
}

/**
 * Parses an LLM response into draft objects. Defensive: handles JSON
 * with leading/trailing whitespace or accidental markdown code fences.
 * Returns an empty array on unrecoverable parse failure.
 */
export function parseDescriptionResponse(
  raw: string
): Array<{ label: string; body: string }> {
  if (!raw || typeof raw !== "string") return []
  // Strip ```json ... ``` fences if present.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]+?)```/i)
  const candidate = (fenced?.[1] ?? raw).trim()
  let parsed: any
  try {
    parsed = JSON.parse(candidate)
  } catch {
    return []
  }
  const drafts = Array.isArray(parsed?.drafts) ? parsed.drafts : null
  if (!drafts) return []
  return drafts
    .map((d: any) => ({
      label:
        typeof d?.label === "string" && d.label.trim().length > 0
          ? d.label.trim()
          : "Draft",
      body: typeof d?.body === "string" ? d.body.trim() : "",
    }))
    .filter((d: { body: string }) => d.body.length > 0)
    .slice(0, 5)
}
