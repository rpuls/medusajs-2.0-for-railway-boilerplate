import {
  AI_PROVIDER,
  AI_REQUEST_TIMEOUT_MS,
  ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL,
  OPENAI_API_KEY,
  OPENAI_MODEL,
} from "../../lib/constants"

import {
  buildProductDescriptionPrompt,
  parseDescriptionResponse,
  type ProductContext,
} from "./prompt"

export type GenerationResult =
  | {
      ok: true
      drafts: Array<{ label: string; body: string }>
      provider: "openai" | "anthropic"
      model: string
    }
  | {
      ok: false
      error: "not_configured" | "timeout" | "rate_limited" | "upstream" | "empty"
      detail?: string
    }

const isConfigured = (): boolean => {
  if (AI_PROVIDER === "openai") return Boolean(OPENAI_API_KEY)
  if (AI_PROVIDER === "anthropic") return Boolean(ANTHROPIC_API_KEY)
  return false
}

const withTimeout = async <T>(p: Promise<T>, ms: number): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`AI request timed out after ${ms}ms`)),
      ms
    )
  })
  try {
    return await Promise.race([p, timeout])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

const callOpenAi = async (
  system: string,
  user: string
): Promise<{ text: string; raw: any }> => {
  const res = await withTimeout(
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500,
      }),
    }),
    AI_REQUEST_TIMEOUT_MS
  )
  if (res.status === 429) {
    const detail = await res.text().catch(() => "")
    throw Object.assign(new Error("rate_limited"), { rateLimited: true, detail })
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`openai ${res.status}: ${detail.slice(0, 200)}`)
  }
  const json: any = await res.json()
  const text = json?.choices?.[0]?.message?.content ?? ""
  return { text, raw: json }
}

const callAnthropic = async (
  system: string,
  user: string
): Promise<{ text: string; raw: any }> => {
  const res = await withTimeout(
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        system,
        max_tokens: 1500,
        messages: [{ role: "user", content: user }],
      }),
    }),
    AI_REQUEST_TIMEOUT_MS
  )
  if (res.status === 429) {
    const detail = await res.text().catch(() => "")
    throw Object.assign(new Error("rate_limited"), { rateLimited: true, detail })
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`anthropic ${res.status}: ${detail.slice(0, 200)}`)
  }
  const json: any = await res.json()
  const blocks = json?.content
  const text = Array.isArray(blocks)
    ? blocks
        .filter((b: any) => b?.type === "text")
        .map((b: any) => String(b.text ?? ""))
        .join("")
    : ""
  return { text, raw: json }
}

/**
 * Generates product description drafts via the configured AI provider.
 *
 * Failure modes are explicit:
 *   - `not_configured`: env vars missing → admin sees a hint, no crash.
 *   - `timeout`: provider took too long → caller suggests retry.
 *   - `rate_limited`: provider rate-limited us → caller suggests retry-after.
 *   - `upstream`: any other provider error.
 *   - `empty`: provider returned but no parseable drafts.
 */
export async function generateProductDescriptions(
  ctx: ProductContext
): Promise<GenerationResult> {
  if (!isConfigured()) {
    return { ok: false, error: "not_configured" }
  }

  let prompt: { system: string; user: string }
  try {
    prompt = buildProductDescriptionPrompt(ctx)
  } catch (err: any) {
    return { ok: false, error: "upstream", detail: err?.message }
  }

  let text = ""
  try {
    const { text: t } =
      AI_PROVIDER === "anthropic"
        ? await callAnthropic(prompt.system, prompt.user)
        : await callOpenAi(prompt.system, prompt.user)
    text = t
  } catch (err: any) {
    if (err?.rateLimited) return { ok: false, error: "rate_limited", detail: err?.detail }
    if (/timed out/i.test(err?.message ?? "")) return { ok: false, error: "timeout" }
    return { ok: false, error: "upstream", detail: err?.message }
  }

  const drafts = parseDescriptionResponse(text)
  if (drafts.length === 0) {
    return { ok: false, error: "empty", detail: text.slice(0, 200) }
  }
  return {
    ok: true,
    drafts,
    provider: AI_PROVIDER,
    model: AI_PROVIDER === "anthropic" ? ANTHROPIC_MODEL : OPENAI_MODEL,
  }
}
