import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Recipe = {
  id: string
  name: string
  decoration_method: string
  description: string | null
  notes: string | null
  recipe_json: Record<string, unknown>
}

const METHOD_LABELS: Record<string, string> = {
  screen_print: "Screen print",
  dtf: "DTF",
  embroidery: "Embroidery",
  uv: "UV",
  digital_transfer: "Digital transfer",
  vinyl: "Vinyl",
  other: "Other",
}

const OrderPrintRecipesWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [linked, setLinked] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [picker, setPicker] = useState("")
  const [picks, setPicks] = useState<Recipe[]>([])
  const [showPicker, setShowPicker] = useState(false)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/recipes`, {
        credentials: "include",
      })
      const json = (await res.json()) as { recipes?: Recipe[] }
      setLinked(json.recipes ?? [])
    } catch {
      // soft fail
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const searchPicks = async () => {
    try {
      const params = new URLSearchParams()
      if (picker) params.set("q", picker)
      const res = await fetch(`/admin/print-recipes?${params.toString()}`, {
        credentials: "include",
      })
      const json = (await res.json()) as { recipes?: Recipe[] }
      setPicks((json.recipes ?? []).slice(0, 20))
    } catch {
      toast.error("Search failed")
    }
  }

  const link = async (recipeId: string) => {
    try {
      const res = await fetch(`/admin/orders/${orderId}/recipes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: recipeId }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Recipe linked")
      await load()
      setShowPicker(false)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to link")
    }
  }

  const unlink = async (recipeId: string) => {
    try {
      const res = await fetch(
        `/admin/orders/${orderId}/recipes?recipe_id=${encodeURIComponent(recipeId)}`,
        { method: "DELETE", credentials: "include" }
      )
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (err: any) {
      toast.error(err?.message ?? "Unlink failed")
    }
  }

  if (!orderId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Print recipes
          <HelpTooltip
            text={{
              title: "Print recipes for this order",
              body: "Recipes are tuning notes — mesh count, flash temp, ink type, embroidery digitization file, etc. — for the operator running this job. Link any reusable recipe from the library, or build one from scratch on /app/print-recipes.",
              bullets: [
                "Each linked recipe shows on the printable work-order so the press operator has the right settings.",
                "Linking stamps the recipe's last_used_at so the library can sort by recency.",
                "Unlinking only removes the association — the recipe itself stays in the library.",
              ],
            }}
          />
        </Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setShowPicker((v) => !v)
            if (!showPicker) searchPicks()
          }}
        >
          {showPicker ? "Cancel" : "Link a recipe"}
        </Button>
      </div>

      {showPicker ? (
        <div className="px-6 pb-4 flex flex-col gap-y-2 border-b border-ui-border-base">
          <div className="flex items-center gap-x-2">
            <Input
              value={picker}
              onChange={(e) => setPicker(e.target.value)}
              placeholder="Search by name, notes…"
              onKeyDown={(e) => {
                if (e.key === "Enter") searchPicks()
              }}
            />
            <Button size="small" variant="secondary" onClick={searchPicks}>
              Search
            </Button>
          </div>
          {picks.length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">No matches.</Text>
          ) : (
            <ul className="divide-y">
              {picks.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between">
                  <div>
                    <Text weight="plus">{r.name}</Text>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {METHOD_LABELS[r.decoration_method] ?? r.decoration_method}
                    </Text>
                  </div>
                  <Button size="small" onClick={() => link(r.id)}>
                    Link
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="px-6 py-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : linked.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No recipes linked. Find or build one in <a href="/app/print-recipes" className="underline">Print recipes</a> then link it here so the work-order shows the operator settings.
          </Text>
        ) : (
          <ul className="divide-y">
            {linked.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-start justify-between gap-x-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-x-2">
                      <Text weight="plus">{r.name}</Text>
                      <Badge color="grey">
                        {METHOD_LABELS[r.decoration_method] ?? r.decoration_method}
                      </Badge>
                    </div>
                    {r.description ? (
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {r.description}
                      </Text>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => unlink(r.id)}
                    className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                    aria-label="Unlink recipe"
                  >
                    <Trash />
                  </button>
                </div>
                {Object.keys(r.recipe_json ?? {}).length > 0 ? (
                  <pre className="mt-2 text-xs bg-ui-bg-subtle p-2 rounded overflow-x-auto">
                    {JSON.stringify(r.recipe_json, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderPrintRecipesWidget, "order-print-recipes")
