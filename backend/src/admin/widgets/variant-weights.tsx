import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Text, Tooltip } from "@medusajs/ui"
import { ChevronDown } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { sdk } from "../lib/sdk"

type VariantRow = {
  id: string
  title: string
  sku: string | null
  weight: number | null
  draft: string
}

const toDraft = (weight: number | null | undefined): string =>
  typeof weight === "number" && Number.isFinite(weight) ? String(weight) : ""

const draftToWeight = (raw: string): number | null => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  const numeric = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null
  }
  return numeric
}

const VariantWeightsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data?.id
  const [collapsed, setCollapsed] = useState(true)
  const [rows, setRows] = useState<VariantRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!productId) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await sdk.admin.product.retrieve(productId, {
        fields: "id,variants.id,variants.title,variants.sku,variants.weight",
      })
      const variants = response?.product?.variants ?? []
      setRows(
        variants.map((variant) => ({
          id: String(variant.id),
          title: variant.title ?? "Variant",
          sku: variant.sku ?? null,
          weight:
            typeof variant.weight === "number"
              ? variant.weight
              : variant.weight != null
                ? Number(variant.weight)
                : null,
          draft: toDraft(variant.weight as number | null | undefined),
        }))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load variants")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const dirtyRows = useMemo(
    () =>
      rows.filter((row) => {
        const next = draftToWeight(row.draft)
        return next !== row.weight
      }),
    [rows]
  )

  const onChangeRow = useCallback((id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, draft: value } : row))
    )
    setSuccess(null)
  }, [])

  const onApplyToAll = useCallback(() => {
    if (!rows.length) {
      return
    }
    const value = rows[0].draft
    setRows((prev) => prev.map((row) => ({ ...row, draft: value })))
    setSuccess(null)
  }, [rows])

  const onSave = useCallback(async () => {
    if (!productId || !dirtyRows.length) {
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updates = dirtyRows.map((row) => ({
        id: row.id,
        weight: draftToWeight(row.draft),
      }))

      await sdk.admin.product.batchVariants(productId, {
        update: updates as any,
      })

      setSuccess(`Saved ${updates.length} variant weight${updates.length === 1 ? "" : "s"}.`)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save variant weights")
    } finally {
      setSaving(false)
    }
  }, [dirtyRows, productId, refresh])

  if (!productId) {
    return null
  }

  return (
    <Container className="p-0 divide-y">
      <div className="flex items-center justify-between gap-2 px-6 py-4">
        <button
          type="button"
          className="flex items-center gap-2 text-left"
          onClick={() => setCollapsed((c) => !c)}
        >
          <ChevronDown
            className={`text-ui-fg-subtle transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          />
          <div>
            <Heading level="h2" className="flex items-center">
              Variant weights (grams)
              <HelpTooltip
                text={{
                  title: "Variant weights (grams)",
                  body: "Per-variant weights in grams. Drives the storefront's flat-rate vs live-quote shipping decision: total cart weight ≤3kg gets flat-rate, >3kg goes to ShipStation for a live quote.",
                  bullets: [
                    "Get the weight from the supplier spec sheet — usually listed per garment in grams already.",
                    "'Apply to all' copies the first row's draft value to every variant. Useful when a supplier publishes the same weight across all sizes (it rarely is, but it's a quick reset).",
                    "0 is a valid weight (digital products, stickers below the freight threshold). Leave blank if you genuinely don't know — the cart will fall back to a default.",
                    "After saving, re-test the storefront cart with a few variants of this product to confirm the right shipping rate appears at checkout.",
                  ],
                }}
              />
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Drives the cart-weight threshold (≤3kg flat-rate / &gt;3kg ShipStation live quote).
            </Text>
          </div>
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Tooltip content="Copy the first row's draft value to every variant.">
              <Button
                size="small"
                variant="secondary"
                disabled={loading || saving || !rows.length}
                onClick={onApplyToAll}
              >
                Apply to all
              </Button>
            </Tooltip>
            <Button
              size="small"
              variant="primary"
              disabled={loading || saving || !dirtyRows.length}
              onClick={onSave}
              isLoading={saving}
            >
              Save{dirtyRows.length ? ` (${dirtyRows.length})` : ""}
            </Button>
          </div>
        )}
      </div>

      {!collapsed && error ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      ) : null}

      {!collapsed && success ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            {success}
          </Text>
        </div>
      ) : null}

      {!collapsed && (
        <div className="px-6 py-4">
          {loading ? (
            <Text size="small" className="text-ui-fg-subtle">
              Loading variants…
            </Text>
          ) : rows.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              This product has no variants yet.
            </Text>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {rows.map((row) => {
                const next = draftToWeight(row.draft)
                const dirty = next !== row.weight
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_140px_120px] items-center gap-3 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <Text size="small" weight="plus" className="text-ui-fg-base">
                        {row.title}
                      </Text>
                      {row.sku ? (
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          SKU: {row.sku}
                        </Text>
                      ) : null}
                    </div>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={50000}
                      step={1}
                      value={row.draft}
                      placeholder="0"
                      onChange={(event) => onChangeRow(row.id, event.target.value)}
                      disabled={saving}
                    />
                    <Text size="xsmall" className={dirty ? "text-ui-fg-interactive" : "text-ui-fg-subtle"}>
                      {dirty ? "Pending" : `Saved: ${row.weight ?? "—"}g`}
                    </Text>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default withWidgetBoundary(VariantWeightsWidget, "variant-weights")
