import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
} from "@medusajs/ui"
import { HelpTooltip } from "../components/reports/help-tooltip"
import { useCallback, useEffect, useMemo, useState } from "react"

type State = {
  isBottle: boolean
  spirit_type: string | null
  capacity_ml: string
  front_w: string
  front_h: string
  back_w: string
  back_h: string
  bottle_shop_id: string | null
}

type ShopRow = {
  id: string
  name: string
  is_active: boolean
}

const SPIRIT_OPTIONS = [
  "vodka",
  "gin",
  "whisky",
  "rum",
  "tequila",
  "cognac",
  "champagne",
  "liqueur",
  "mezcal",
] as const

const BLANK: State = {
  isBottle: false,
  spirit_type: null,
  capacity_ml: "",
  front_w: "",
  front_h: "",
  back_w: "",
  back_h: "",
  bottle_shop_id: null,
}

const stripBlank = (v: string): string | null => {
  const t = v.trim()
  return t.length ? t : null
}

const parseNum = (v: string): number | null => {
  const t = v.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? n : null
}

const ProductBottleSetupWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data?.id
  const [state, setState] = useState<State>(BLANK)
  const [original, setOriginal] = useState<State>(BLANK)
  const [shops, setShops] = useState<ShopRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const [setupRes, shopsRes] = await Promise.all([
        fetch(`/admin/products/${productId}/bottle-setup`, { credentials: "include" }),
        fetch("/admin/bottle-shops?limit=500", { credentials: "include" }),
      ])
      if (!setupRes.ok) throw new Error(`bottle-setup HTTP ${setupRes.status}`)
      if (!shopsRes.ok) throw new Error(`bottle-shops HTTP ${shopsRes.status}`)
      const setup = await setupRes.json()
      const shopsJson = await shopsRes.json()

      const next: State = {
        isBottle: setup.product_class === "bottle",
        spirit_type: setup.spirit_type ?? null,
        capacity_ml:
          typeof setup.bottle_capacity_ml === "number"
            ? String(setup.bottle_capacity_ml)
            : "",
        front_w:
          setup.bottle_label_dimensions_cm?.width !== undefined
            ? String(setup.bottle_label_dimensions_cm.width)
            : "",
        front_h:
          setup.bottle_label_dimensions_cm?.height !== undefined
            ? String(setup.bottle_label_dimensions_cm.height)
            : "",
        back_w:
          setup.bottle_back_label_dimensions_cm?.width !== undefined
            ? String(setup.bottle_back_label_dimensions_cm.width)
            : "",
        back_h:
          setup.bottle_back_label_dimensions_cm?.height !== undefined
            ? String(setup.bottle_back_label_dimensions_cm.height)
            : "",
        bottle_shop_id: setup.bottle_shop_id ?? null,
      }
      setState(next)
      setOriginal(next)
      setShops((shopsJson.bottle_shops ?? []) as ShopRow[])
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void load()
  }, [load])

  const dirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(original),
    [state, original]
  )

  const save = async () => {
    if (!productId) return
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        product_class_bottle: state.isBottle,
        spirit_type: state.isBottle ? state.spirit_type ?? null : null,
        bottle_capacity_ml: state.isBottle ? parseNum(state.capacity_ml) : null,
        bottle_label_dimensions_cm:
          state.isBottle && parseNum(state.front_w) && parseNum(state.front_h)
            ? { width: parseNum(state.front_w), height: parseNum(state.front_h) }
            : null,
        bottle_back_label_dimensions_cm:
          state.isBottle && parseNum(state.back_w) && parseNum(state.back_h)
            ? { width: parseNum(state.back_w), height: parseNum(state.back_h) }
            : null,
        bottle_shop_id: state.isBottle ? stripBlank(state.bottle_shop_id ?? "") : null,
      }

      const res = await fetch(`/admin/products/${productId}/bottle-setup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json as any)?.message ?? `HTTP ${res.status}`)
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
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2" className="flex items-center">
          Bottle setup
          <HelpTooltip
            text={{
              title: "Bottle product setup",
              body: "Flag this product as a bottle so it routes through the spirits taxonomy + bottle customizer instead of the apparel customizer. Set the label print area, capacity, spirit type, and which bottle-shop partner supplies it.",
              bullets: [
                "Toggle 'Is a bottle' — sets metadata.product_class = \"bottle\". This is what the storefront branches on.",
                "Spirit type drives the category placement (/spirits/[type]).",
                "Label dimensions (cm) determine the customizer canvas print area.",
                "Bottle shop ID is the partner who supplies the bottle when an order ships.",
                "Set metadata.decoration_methods = [\"uv\"] on the product for UV DTF print pricing.",
              ],
            }}
          />
        </Heading>
        {loading ? <Badge color="grey">Loading…</Badge> : null}
        {!loading && state.isBottle ? <Badge color="green">Bottle</Badge> : null}
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Switch
            id="is-bottle"
            checked={state.isBottle}
            onCheckedChange={(v) => setState((s) => ({ ...s, isBottle: v }))}
          />
          <Label htmlFor="is-bottle" className="text-sm">Is a bottle product</Label>
        </div>

        {state.isBottle ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Spirit type</Label>
                <Select
                  value={state.spirit_type ?? ""}
                  onValueChange={(v) =>
                    setState((s) => ({
                      ...s,
                      spirit_type: v === "" ? null : v,
                    }))
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Pick a spirit" />
                  </Select.Trigger>
                  <Select.Content>
                    {SPIRIT_OPTIONS.map((opt) => (
                      <Select.Item key={opt} value={opt}>
                        {opt}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Capacity (ml)</Label>
                <Input
                  type="number"
                  value={state.capacity_ml}
                  onChange={(e) =>
                    setState((s) => ({ ...s, capacity_ml: e.currentTarget.value }))
                  }
                  placeholder="700"
                  min={0}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Bottle shop (supplier)</Label>
              <Select
                value={state.bottle_shop_id ?? ""}
                onValueChange={(v) =>
                  setState((s) => ({
                    ...s,
                    bottle_shop_id: v === "" ? null : v,
                  }))
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Pick a bottle shop" />
                </Select.Trigger>
                <Select.Content>
                  {shops
                    .filter((s) => s.is_active || s.id === state.bottle_shop_id)
                    .map((s) => (
                      <Select.Item key={s.id} value={s.id}>
                        {s.name}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select>
              {shops.length === 0 ? (
                <Text size="xsmall" className="text-ui-fg-muted mt-1">
                  No bottle shops yet — create one at <code>/app/bottle-shops</code>.
                </Text>
              ) : null}
            </div>

            <div>
              <Label className="text-xs">Front label dimensions (cm)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={state.front_w}
                  onChange={(e) =>
                    setState((s) => ({ ...s, front_w: e.currentTarget.value }))
                  }
                  placeholder="Width (8.5)"
                />
                <Input
                  type="number"
                  step="0.1"
                  value={state.front_h}
                  onChange={(e) =>
                    setState((s) => ({ ...s, front_h: e.currentTarget.value }))
                  }
                  placeholder="Height (11)"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">
                Back label dimensions (cm) — optional
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={state.back_w}
                  onChange={(e) =>
                    setState((s) => ({ ...s, back_w: e.currentTarget.value }))
                  }
                  placeholder="Width"
                />
                <Input
                  type="number"
                  step="0.1"
                  value={state.back_h}
                  onChange={(e) =>
                    setState((s) => ({ ...s, back_h: e.currentTarget.value }))
                  }
                  placeholder="Height"
                />
              </div>
              <Text size="xsmall" className="text-ui-fg-muted mt-1">
                Leave blank for single-sided labels.
              </Text>
            </div>
          </>
        ) : (
          <Text size="small" className="text-ui-fg-subtle">
            Toggle on to flag this product as a bottle. Apparel products should leave this off.
          </Text>
        )}

        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : null}

        <div className="flex justify-end gap-x-2">
          <Button variant="transparent" disabled={loading} onClick={load}>
            Refresh
          </Button>
          <Button variant="primary" disabled={!dirty || saving} onClick={save}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default withWidgetBoundary(
  ProductBottleSetupWidget,
  "product-bottle-setup"
)
