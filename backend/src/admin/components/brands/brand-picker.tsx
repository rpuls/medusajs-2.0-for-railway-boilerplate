import { Select, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

export type BrandOption = {
  id: string
  name: string
  handle: string
  parent_id: string | null
}

type BrandPickerProps = {
  value: string | null
  onChange: (id: string | null) => void
  disabled?: boolean
  placeholder?: string
  /**
   * Brand ID to exclude from the list (used by the brand-edit form so a brand
   * can't pick itself as its parent).
   */
  excludeId?: string
  /**
   * When true, only top-level brands (parent_id === null) are listed. Used by
   * the parent-picker on the brand-edit form.
   */
  topLevelOnly?: boolean
  /**
   * Whether to render an "(None)" option that maps to a null id.
   */
  allowNone?: boolean
  size?: "small" | "base" | "large"
}

let cachedBrandsPromise: Promise<BrandOption[]> | null = null

async function fetchBrandsCached(): Promise<BrandOption[]> {
  if (!cachedBrandsPromise) {
    cachedBrandsPromise = (async () => {
      const res = await fetch("/admin/brands?limit=500", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return (data.brands ?? []) as BrandOption[]
    })().catch((err) => {
      cachedBrandsPromise = null
      throw err
    })
  }
  return cachedBrandsPromise
}

export function invalidateBrandPickerCache(): void {
  cachedBrandsPromise = null
}

const NONE_VALUE = "__none__"

export function BrandPicker({
  value,
  onChange,
  disabled,
  placeholder,
  excludeId,
  topLevelOnly,
  allowNone,
  size = "base",
}: BrandPickerProps) {
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchBrandsCached()
      .then((list) => {
        if (!cancelled) {
          setBrands(list)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? String(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(() => {
    return brands.filter((b) => {
      if (excludeId && b.id === excludeId) return false
      if (topLevelOnly && b.parent_id !== null) return false
      return true
    })
  }, [brands, excludeId, topLevelOnly])

  if (error) {
    return (
      <Text size="xsmall" className="text-ui-tag-red-icon">
        Failed to load brands: {error}
      </Text>
    )
  }

  return (
    <Select
      value={value ?? (allowNone ? NONE_VALUE : undefined)}
      onValueChange={(v) => onChange(v === NONE_VALUE ? null : v)}
      disabled={disabled || loading}
    >
      <Select.Trigger size={size === "small" ? "small" : "base"}>
        <Select.Value placeholder={placeholder ?? (loading ? "Loading…" : "Select brand…")} />
      </Select.Trigger>
      <Select.Content>
        {allowNone ? (
          <Select.Item value={NONE_VALUE}>
            <span className="text-ui-fg-muted">(None)</span>
          </Select.Item>
        ) : null}
        {options.map((b) => (
          <Select.Item key={b.id} value={b.id}>
            {b.name}
            {b.parent_id ? (
              <span className="text-ui-fg-muted text-xs ml-2">
                · child of {brands.find((p) => p.id === b.parent_id)?.name ?? "?"}
              </span>
            ) : null}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}
