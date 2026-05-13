import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { BrandPicker } from "../components/brands/brand-picker"

type LinkedBrand = {
  id: string
  name: string
  handle: string
  external_code: string | null
  parent_id: string | null
}

const ProductBrandWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data?.id
  const [linked, setLinked] = useState<LinkedBrand | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/admin/products/${productId}/brand`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const b = (json.brand as LinkedBrand | null) ?? null
      setLinked(b)
      setSelected(b?.id ?? null)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { void load() }, [load])

  const dirty = (linked?.id ?? null) !== selected

  const save = async () => {
    if (!productId) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/admin/products/${productId}/brand`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_id: selected }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.message ?? `HTTP ${res.status}`)
      }
      setSavedAt(Date.now())
      await load()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setSaving(false)
    }
  }

  if (!productId) return null

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Brand</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          The brand this product belongs to. Drives storefront filtering, brand
          landing pages, and supplier-mix reporting.
        </Text>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-3">
        {error ? (
          <Text size="small" className="text-ui-tag-red-icon">{error}</Text>
        ) : null}
        <BrandPicker
          value={selected}
          onChange={setSelected}
          disabled={loading || saving}
          allowNone
          placeholder={loading ? "Loading…" : "(No brand)"}
        />
        <div className="flex items-center justify-between">
          <Text size="xsmall" className="text-ui-fg-muted">
            {linked ? (
              <>
                Currently <span className="font-medium">{linked.name}</span>
                {linked.external_code ? ` · ${linked.external_code}` : ""}
              </>
            ) : (
              <>No brand assigned.</>
            )}
            {savedAt ? <span className="ml-2 text-ui-fg-subtle">· saved</span> : null}
          </Text>
          <Button
            size="small"
            onClick={save}
            disabled={!dirty || saving}
            isLoading={saving}
          >
            Save
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default withWidgetBoundary(ProductBrandWidget, "product-brand")
