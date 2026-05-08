import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
const MODEL = "claude-sonnet-4-5-20251001"
const MAX_IMAGE_BYTES = 6 * 1024 * 1024 // 6 MB after base64 — Anthropic limit is ~5 MB raw

const SYSTEM_PROMPT = `You estimate stitch counts for embroidered logos and artwork
on apparel. You receive an image plus the intended embroidered size (width / height
in millimetres) and return a stitch-count range, a complexity rating, and brief notes.

How to estimate:
- Embroidery uses fill stitches (tightly packed inside shapes), satin stitches
  (parallel passes outlining or filling narrow shapes), and run stitches
  (single-line outlines / details).
- A useful rule of thumb is 1,500–2,200 stitches per square inch (≈ 232–340 per
  cm²) for typical fill-heavy designs at production density. Outline-only or
  text-only designs run lighter (300–800 stitches per cm²).
- Multiply by the area implied by the supplied dimensions, adjust for the
  visual density (lots of solid fills → upper bound; line-art / text → lower
  bound).
- Cap your maximum at 50,000. Designs over 12,000 stitches will be flagged
  for manual quote on our side, so accuracy matters most in the 0–12,000 range.

Output STRICT JSON only — no prose, no markdown — matching this schema:
{
  "stitchesMin": <integer>,
  "stitchesMax": <integer>,
  "complexity": "low" | "medium" | "high",
  "notes": "<one short sentence explaining the range, mentioning any concerns>"
}

Notes guidance:
- Mention if very fine details may not stitch cleanly (text under 5 mm tall,
  line widths under 1 mm).
- If the artwork looks unsuitable for embroidery (photographic gradient,
  hundreds of colours, halftones), say so and bias to the upper bound.
- Keep notes under 240 characters.`

type EstimateBody = {
  /** Base64-encoded image data (data: URL or raw base64). */
  imageBase64?: unknown
  /** MIME type of the image. */
  mediaType?: unknown
  /** Intended embroidered width in mm. */
  widthMm?: unknown
  /** Intended embroidered height in mm. */
  heightMm?: unknown
}

const stripDataUrl = (raw: string): { mediaType: string | null; base64: string } => {
  if (raw.startsWith("data:")) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(raw)
    if (match) return { mediaType: match[1], base64: match[2] }
  }
  return { mediaType: null, base64: raw }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "unavailable",
        message:
          "Stitch estimation is unavailable right now — enter the count manually or email info@scprints.com.au.",
      },
      { status: 503 }
    )
  }

  let body: EstimateBody
  try {
    body = (await req.json()) as EstimateBody
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  if (typeof body.imageBase64 !== "string" || !body.imageBase64.length) {
    return NextResponse.json(
      { error: "missing_image", message: "Image data is required." },
      { status: 400 }
    )
  }
  const widthMm = Number(body.widthMm)
  const heightMm = Number(body.heightMm)
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm <= 0 || heightMm <= 0) {
    return NextResponse.json(
      { error: "missing_dimensions", message: "Embroidered width and height (mm) are required." },
      { status: 400 }
    )
  }

  const { mediaType: parsedType, base64 } = stripDataUrl(body.imageBase64)
  const mediaType =
    typeof body.mediaType === "string" && body.mediaType.length
      ? body.mediaType
      : parsedType ?? "image/png"

  // Soft budget guard. Anthropic enforces ~5MB; we set 6MB on the base64
  // string (which inflates ~33% over raw bytes) so most legit uploads pass.
  if (base64.length > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: "image_too_large",
        message: "Image is too large for stitch analysis. Resize under 5 MB and try again.",
      },
      { status: 413 }
    )
  }

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            // Cache the prompt — every call to this route uses the same
            // instructions, so prompt-cache hits make the second-onward
            // request meaningfully faster.
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `Embroider this artwork at approximately ${Math.round(
                  widthMm
                )} × ${Math.round(
                  heightMm
                )} mm. Return JSON only.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error("Stitch estimator upstream error", response.status, detail.slice(0, 500))
      return NextResponse.json(
        {
          error: "upstream_error",
          message: "Stitch analysis is busy right now. Please try again shortly or enter the count manually.",
        },
        { status: 502 }
      )
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>
    }
    const text = data.content?.find((part) => part.type === "text")?.text?.trim() ?? ""

    let parsed: {
      stitchesMin?: number
      stitchesMax?: number
      complexity?: "low" | "medium" | "high"
      notes?: string
    } | null = null
    try {
      // Tolerate stray ```json fences or surrounding whitespace.
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      console.error("Stitch estimator could not parse model output:", text.slice(0, 500))
      return NextResponse.json(
        {
          error: "parse_error",
          message: "Couldn't read the AI response. Please enter the stitch count manually.",
        },
        { status: 502 }
      )
    }

    const min = Math.max(0, Math.round(Number(parsed?.stitchesMin ?? 0)))
    const max = Math.max(min, Math.round(Number(parsed?.stitchesMax ?? min)))
    const complexity =
      parsed?.complexity === "low" ||
      parsed?.complexity === "medium" ||
      parsed?.complexity === "high"
        ? parsed.complexity
        : "medium"
    const notes =
      typeof parsed?.notes === "string"
        ? parsed.notes.slice(0, 240)
        : ""

    return NextResponse.json({
      stitchesMin: min,
      stitchesMax: max,
      complexity,
      notes,
    })
  } catch (error) {
    console.error("Stitch estimator route error", error)
    return NextResponse.json(
      {
        error: "unexpected_error",
        message: "Stitch analysis is unavailable right now. Please enter the count manually.",
      },
      { status: 500 }
    )
  }
}
