import { Input, Label, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type VariantRow = {
  variant_id: string
  sku: string | null
  title: string
  product_title: string
  product_id: string | null
  in_stock: number
}

type Response = {
  threshold: number
  summary: {
    total_managed_variants: number
    out_of_stock: number
    low_stock: number
  }
  out_of_stock: VariantRow[]
  low_stock: VariantRow[]
  data_available: boolean
  error?: string
}

const KpiTile = ({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text
      className="text-2xl font-semibold tabular-nums"
      style={color ? { color } : undefined}
    >
      {value}
    </Text>
  </div>
)

const VariantList = ({
  rows,
  emptyLabel,
  inStockColor,
}: {
  rows: VariantRow[]
  emptyLabel: string
  inStockColor: string
}) => {
  if (rows.length === 0) {
    return (
      <Text size="xsmall" className="text-ui-fg-muted">
        {emptyLabel}
      </Text>
    )
  }
  return (
    <div className="overflow-auto max-h-72">
      <table className="w-full text-sm">
        <thead className="text-left text-ui-fg-subtle text-xs sticky top-0 bg-ui-bg-base">
          <tr className="border-b border-ui-border-base">
            <th className="px-2 py-1 font-medium">Product</th>
            <th className="px-2 py-1 font-medium">Variant</th>
            <th className="px-2 py-1 font-medium">SKU</th>
            <th className="px-2 py-1 font-medium text-right">In stock</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const href = r.product_id ? `/app/products/${r.product_id}` : null
            const inner = (
              <>
                <td className="px-2 py-1">
                  <Text size="small" className="truncate">
                    {r.product_title}
                  </Text>
                </td>
                <td className="px-2 py-1">
                  <Text size="xsmall" className="text-ui-fg-muted truncate">
                    {r.title}
                  </Text>
                </td>
                <td className="px-2 py-1">
                  <Text size="xsmall" className="font-mono truncate">
                    {r.sku ?? "—"}
                  </Text>
                </td>
                <td
                  className="px-2 py-1 tabular-nums text-right font-medium"
                  style={{ color: inStockColor }}
                >
                  {r.in_stock}
                </td>
              </>
            )
            if (href) {
              return (
                <tr
                  key={r.variant_id}
                  className="border-b border-ui-border-base cursor-pointer hover:bg-ui-bg-subtle"
                  onClick={() => {
                    window.location.href = href
                  }}
                >
                  {inner}
                </tr>
              )
            }
            return (
              <tr key={r.variant_id} className="border-b border-ui-border-base">
                {inner}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export const InventoryStatusChart = (_props: {
  fromIso?: string
  toIso?: string
  regionId?: string | null
}) => {
  // Inventory is a current-state signal — date range and region don't
  // apply at the variant-stock level. Props accepted for filter-bar
  // consistency, just ignored.
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thresholdDraft, setThresholdDraft] = useState("10")

  const refresh = (threshold: string) => {
    setLoading(true)
    setError(null)
    const t = Number(threshold)
    const params = new URLSearchParams()
    if (Number.isFinite(t) && t >= 0) params.set("threshold", String(Math.floor(t)))
    fetch(`/admin/reports/inventory-status?${params.toString()}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((j) => setData(j as Response))
      .catch((e) => setError(e?.message ?? String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh(thresholdDraft)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summary = data?.summary

  return (
    <ReportCard
      title="Inventory status"
      caption="Out-of-stock and low-stock variants across all locations. Updates on demand — independent of the date range above since stock is a current-state signal."
      loading={loading}
      error={error}
      rightAccessory={
        <div className="flex items-center gap-x-2">
          <Label className="text-xs text-ui-fg-subtle">Low-stock under</Label>
          <Input
            value={thresholdDraft}
            onChange={(e) => setThresholdDraft(e.currentTarget.value)}
            onBlur={() => refresh(thresholdDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") refresh(thresholdDraft)
            }}
            size="small"
            className="w-16"
            type="number"
            min={0}
          />
        </div>
      }
      csv={
        !data || !data.data_available
          ? undefined
          : {
              filenameBase: "inventory-status",
              build: () => {
                const rows: Array<[string, string, string, string, number, string]> = []
                for (const r of data.out_of_stock) {
                  rows.push([
                    r.product_title,
                    r.title,
                    r.sku ?? "",
                    r.variant_id,
                    r.in_stock,
                    "out_of_stock",
                  ])
                }
                for (const r of data.low_stock) {
                  rows.push([
                    r.product_title,
                    r.title,
                    r.sku ?? "",
                    r.variant_id,
                    r.in_stock,
                    "low_stock",
                  ])
                }
                return buildCsv(
                  ["Product", "Variant", "SKU", "Variant ID", "In stock", "Status"],
                  rows
                )
              },
            }
      }
    >
      {data && !data.data_available ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Inventory data couldn't be loaded — the variant↔inventory graph
          query failed. Detail in server logs. (Reports continue to work;
          this card just shows zeros until the link traversal is fixed.)
        </Text>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <KpiTile
          label="Out of stock"
          value={String(summary?.out_of_stock ?? 0)}
          color={
            (summary?.out_of_stock ?? 0) > 0 ? PALETTE.rose600 : PALETTE.emerald600
          }
        />
        <KpiTile
          label={`Low stock (< ${data?.threshold ?? 10})`}
          value={String(summary?.low_stock ?? 0)}
          color={
            (summary?.low_stock ?? 0) > 0 ? PALETTE.amber600 : PALETTE.emerald600
          }
        />
        <KpiTile
          label="Managed variants"
          value={String(summary?.total_managed_variants ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
        <div className="flex flex-col gap-y-2">
          <Text size="small" className="font-semibold">
            Out of stock
          </Text>
          <VariantList
            rows={data?.out_of_stock ?? []}
            emptyLabel="Nothing is out of stock — clean run."
            inStockColor={PALETTE.rose600}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Text size="small" className="font-semibold">
            Low stock
          </Text>
          <VariantList
            rows={data?.low_stock ?? []}
            emptyLabel="No variants under the threshold."
            inStockColor={PALETTE.amber600}
          />
        </div>
      </div>
    </ReportCard>
  )
}
