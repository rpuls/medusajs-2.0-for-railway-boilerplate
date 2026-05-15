import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Draft = { label: string; body: string }

const NOT_CONFIGURED_HINT =
  "AI provider not configured. Set AI_PROVIDER + the matching API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) on Railway."

const ProductAiDescriptionWidget = ({
  data: product,
}: {
  data: { id: string; description?: string | null }
}) => {
  const productId = product?.id
  const [hint, setHint] = useState("")
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [provider, setProvider] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState<number | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/admin/products/${productId}/generate-description`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hint: hint.trim() || undefined }),
        }
      )
      const json = (await res.json()) as {
        drafts?: Draft[]
        provider?: string
        error?: string
        detail?: string
      }
      if (!res.ok) {
        if (res.status === 503 || json.error === "not_configured") {
          setError(NOT_CONFIGURED_HINT)
        } else if (res.status === 429 || json.error === "rate_limited") {
          setError(
            "The AI provider rate-limited us. Try again in a minute, or check your plan / quota."
          )
        } else if (res.status === 504 || json.error === "timeout") {
          setError(
            "The AI provider took too long to respond. Try again — usually transient."
          )
        } else if (json.error === "empty") {
          setError(
            "The model returned a response but no valid drafts. Try again with a different hint."
          )
        } else {
          setError(json.detail || json.error || `Server returned ${res.status}.`)
        }
        setDrafts([])
        return
      }
      setDrafts(json.drafts ?? [])
      setProvider(json.provider ?? null)
    } catch (err: any) {
      setError(err?.message ?? "Network error.")
    } finally {
      setLoading(false)
    }
  }

  const applyDraft = async (draft: Draft, idx: number) => {
    if (
      !confirm(
        "Replace the product's description with this draft? You can change it again later."
      )
    ) {
      return
    }
    setApplying(idx)
    try {
      const res = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: draft.body }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Description applied. Reload the page to see it.")
    } catch (err: any) {
      toast.error(err?.message ?? "Apply failed")
    } finally {
      setApplying(null)
    }
  }

  if (!productId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          AI description
          <HelpTooltip
            text={{
              title: "AI product description generator",
              body: "Generates 3 description drafts (short → standard → detailed) from the product's title, brand, type, weight, tags, variants, and any safe metadata fields. Pick the one closest to right, edit if needed, then click Apply.",
              bullets: [
                "Uses OpenAI or Anthropic depending on AI_PROVIDER env var.",
                "Doesn't send pricing, SKUs, or stock to the model.",
                "Sends a brand voice cue so output stays on-brand for SC PRINTS.",
                "Apply replaces the existing description in place — you can roll back manually via Medusa core.",
                "Optional Hint biases the model (e.g. 'team kit', 'winter casual').",
              ],
            }}
          />
        </Heading>
        {provider ? <Badge color="blue">via {provider}</Badge> : null}
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-3">
        <div className="flex items-end gap-x-2">
          <div className="flex-1">
            <Text size="xsmall" className="text-ui-fg-muted">
              Hint (optional)
            </Text>
            <Input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. team kit, winter casual"
              disabled={loading}
            />
          </div>
          <Button size="small" onClick={generate} disabled={loading}>
            {loading ? "Generating…" : "Generate drafts"}
          </Button>
        </div>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
            <Text size="small" className="text-rose-800">
              {error}
            </Text>
          </div>
        ) : null}

        {drafts.length > 0 ? (
          <ul className="flex flex-col gap-y-3">
            {drafts.map((d, idx) => (
              <li
                key={idx}
                className="rounded-md border border-ui-border-base bg-ui-bg-base"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-ui-border-base">
                  <Text size="small" weight="plus">
                    {d.label}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {d.body.length} chars
                  </Text>
                </div>
                <div className="px-3 py-2">
                  <Textarea
                    rows={Math.min(
                      6,
                      Math.max(2, Math.ceil(d.body.length / 90))
                    )}
                    value={d.body}
                    onChange={(e) => {
                      const next = [...drafts]
                      next[idx] = { ...next[idx], body: e.target.value }
                      setDrafts(next)
                    }}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="small"
                      onClick={() => applyDraft(d, idx)}
                      disabled={applying !== null}
                    >
                      {applying === idx ? "Applying…" : "Apply this draft"}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default withWidgetBoundary(
  ProductAiDescriptionWidget,
  "product-ai-description"
)
