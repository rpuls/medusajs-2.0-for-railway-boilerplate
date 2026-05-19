import { Button, Heading, Input, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import type {
  POSLineItem,
  POSProduct,
  POSProductVariant,
  POSRegion,
} from "../types"
import { formatMoney, ulid } from "../utils"

type Props = {
  region: POSRegion | null
  onAddItem: (item: POSLineItem) => void
  onOpenCustomizer: () => void
}

export const ProductSearchPanel = ({
  region,
  onAddItem,
  onOpenCustomizer,
}: Props) => {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<POSProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => {
      void search(query)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, region?.id])

  const search = async (q: string) => {
    if (!region) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      params.set("limit", "20")
      params.set(
        "fields",
        "id,title,handle,thumbnail,variants.id,variants.title,variants.sku,variants.calculated_price.*"
      )
      // Region context loads variants' calculated_price.
      params.set("region_id", region.id)

      const res = await fetch(`/admin/products?${params}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error(`Search failed (${res.status})`)
      }
      const json = (await res.json()) as { products: POSProduct[] }
      setProducts(json.products ?? [])
    } catch (err: any) {
      setError(err?.message ?? "Search failed")
    } finally {
      setLoading(false)
    }
  }

  const addVariant = (product: POSProduct, variant: POSProductVariant) => {
    const priceCents = variant.calculated_price
      ? Math.round(variant.calculated_price.calculated_amount * 100)
      : null
    const item: POSLineItem = {
      id: ulid(),
      kind: "standard",
      variant_id: variant.id,
      product_id: product.id,
      product_title: product.title,
      variant_title: variant.title,
      quantity: 1,
      unit_price_cents: priceCents,
      metadata: {},
      added_at: new Date().toISOString(),
    }
    onAddItem(item)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-ui-border-base">
        <Heading level="h2" className="mb-3">
          Products
        </Heading>
        <Input
          placeholder="Search by name, SKU, handle…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <Button
          variant="secondary"
          size="small"
          className="w-full mt-2"
          onClick={onOpenCustomizer}
        >
          + Add custom design (open customizer)
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading && (
          <Text size="small" className="text-ui-fg-muted py-3">
            Loading…
          </Text>
        )}
        {error && (
          <Text size="small" className="text-ui-fg-error py-3">
            {error}
          </Text>
        )}
        {!loading && !error && products.length === 0 && (
          <Text size="small" className="text-ui-fg-muted py-3">
            {query ? "No products found." : "Type to search products."}
          </Text>
        )}

        <ul className="divide-y divide-ui-border-base">
          {products.map((p) => {
            const isExpanded = expanded === p.id
            const oneVariant = (p.variants ?? []).length === 1
            const variantToShow = (p.variants ?? [])[0]
            return (
              <li key={p.id} className="py-2">
                <button
                  className="w-full flex items-center gap-3 text-left hover:bg-ui-bg-subtle rounded-md px-2 py-1"
                  onClick={() => {
                    if (oneVariant && variantToShow) {
                      addVariant(p, variantToShow)
                    } else {
                      setExpanded(isExpanded ? null : p.id)
                    }
                  }}
                >
                  {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-10 h-10 rounded object-cover bg-ui-bg-subtle"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-ui-bg-subtle" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Text size="small" className="truncate font-medium">
                      {p.title}
                    </Text>
                    {oneVariant && variantToShow?.calculated_price && (
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {formatMoney(
                          Math.round(
                            variantToShow.calculated_price.calculated_amount *
                              100
                          ),
                          variantToShow.calculated_price.currency_code.toUpperCase()
                        )}
                      </Text>
                    )}
                  </div>
                </button>

                {isExpanded && !oneVariant && (
                  <ul className="ml-12 mt-1 space-y-1">
                    {(p.variants ?? []).map((v) => (
                      <li key={v.id}>
                        <button
                          className="w-full text-left text-xs px-2 py-1 rounded hover:bg-ui-bg-subtle flex justify-between"
                          onClick={() => addVariant(p, v)}
                        >
                          <span>{v.title}</span>
                          {v.calculated_price && (
                            <span className="text-ui-fg-muted">
                              {formatMoney(
                                Math.round(
                                  v.calculated_price.calculated_amount * 100
                                ),
                                v.calculated_price.currency_code.toUpperCase()
                              )}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
