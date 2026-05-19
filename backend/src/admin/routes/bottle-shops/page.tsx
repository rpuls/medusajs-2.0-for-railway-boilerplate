import { defineRouteConfig } from "@medusajs/admin-sdk"
import { HelpTooltip } from "../../components/reports/help-tooltip"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
} from "@medusajs/ui"
import { ArrowPath, Plus, PencilSquare, Trash, BuildingStorefront } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"

type BottleShop = {
  id: string
  name: string
  handle: string
  email: string | null
  contact_name: string | null
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country_code: string | null
  notes: string | null
  is_active: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

type Draft = {
  name: string
  handle: string
  email: string
  contact_name: string
  phone: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country_code: string
  notes: string
  is_active: boolean
}

const BLANK: Draft = {
  name: "",
  handle: "",
  email: "",
  contact_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country_code: "AU",
  notes: "",
  is_active: true,
}

const toDraft = (shop: BottleShop): Draft => ({
  name: shop.name,
  handle: shop.handle,
  email: shop.email ?? "",
  contact_name: shop.contact_name ?? "",
  phone: shop.phone ?? "",
  address_line_1: shop.address_line_1 ?? "",
  address_line_2: shop.address_line_2 ?? "",
  city: shop.city ?? "",
  state: shop.state ?? "",
  postal_code: shop.postal_code ?? "",
  country_code: shop.country_code ?? "AU",
  notes: shop.notes ?? "",
  is_active: shop.is_active,
})

const toPayload = (d: Draft) => ({
  name: d.name.trim(),
  handle: d.handle.trim() || undefined,
  email: d.email.trim() || null,
  contact_name: d.contact_name.trim() || null,
  phone: d.phone.trim() || null,
  address_line_1: d.address_line_1.trim() || null,
  address_line_2: d.address_line_2.trim() || null,
  city: d.city.trim() || null,
  state: d.state.trim() || null,
  postal_code: d.postal_code.trim() || null,
  country_code: d.country_code.trim().toUpperCase() || null,
  notes: d.notes.trim() || null,
  is_active: d.is_active,
})

const BottleShopDrawer = ({
  open,
  onClose,
  editShop,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editShop: BottleShop | null
  onSaved: () => void
}) => {
  const [draft, setDraft] = useState<Draft>(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(editShop ? toDraft(editShop) : { ...BLANK })
      setError(null)
    }
  }, [open, editShop])

  const submit = async () => {
    if (!draft.name.trim()) {
      setError("Bottle shop name is required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const url = editShop ? `/admin/bottle-shops/${editShop.id}` : "/admin/bottle-shops"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(toPayload(draft)),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message ?? json?.error ?? `HTTP ${res.status}`)
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setSaving(false)
    }
  }

  const field = (
    label: string,
    key: keyof Draft,
    placeholder?: string,
    type: "input" | "textarea" = "input"
  ) => (
    <div className="flex flex-col gap-y-1">
      <Label className="text-xs">{label}</Label>
      {type === "textarea" ? (
        <Textarea
          value={String(draft[key] ?? "")}
          onChange={(e) =>
            setDraft((d) => ({ ...d, [key]: e.currentTarget.value }))
          }
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <Input
          value={String(draft[key] ?? "")}
          onChange={(e) =>
            setDraft((d) => ({ ...d, [key]: e.currentTarget.value }))
          }
          placeholder={placeholder}
        />
      )}
    </div>
  )

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Drawer.Content className="max-w-lg">
        <Drawer.Header>
          <Drawer.Title>{editShop ? "Edit bottle shop" : "New bottle shop"}</Drawer.Title>
          <Drawer.Description>
            Bottle shops supply branded spirit bottles. Orders containing a bottle product are forwarded to the shop's email when staff click "Send to bottle shop" on the order detail.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="overflow-auto">
          <div className="flex flex-col gap-y-4 p-1">
            {field("Name *", "name", "e.g. Vincent Vodka Co")}
            {field("Handle", "handle", "auto-derived from name if blank")}
            {field("Email", "email", "orders@bottleshop.example")}
            {field("Contact name", "contact_name", "Jane Doe")}
            {field("Phone", "phone", "+61 2 1234 5678")}
            <div className="grid grid-cols-2 gap-2">
              {field("Address line 1", "address_line_1", "Unit 1")}
              {field("Address line 2", "address_line_2", "12 Smith St")}
              {field("City", "city", "Sydney")}
              {field("State", "state", "NSW")}
              {field("Postal code", "postal_code", "2000")}
              {field("Country", "country_code", "AU")}
            </div>
            {field("Notes", "notes", "Internal notes about this supplier", "textarea")}
            <div className="flex items-center gap-x-2">
              <Switch
                id="bs-active"
                checked={draft.is_active}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, is_active: v }))}
              />
              <Label htmlFor="bs-active" className="text-sm">Active</Label>
              <Text size="xsmall" className="text-ui-fg-muted ml-2">
                Inactive shops won't appear in the product setup picker.
              </Text>
            </div>
            {error ? (
              <Text size="small" className="text-ui-tag-red-icon">{error}</Text>
            ) : null}
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} isLoading={saving}>
            {editShop ? "Save changes" : "Create bottle shop"}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const BottleShopsPage = () => {
  const [shops, setShops] = useState<BottleShop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editShop, setEditShop] = useState<BottleShop | null>(null)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/admin/bottle-shops?limit=500", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setShops(data.bottle_shops ?? [])
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    if (!search.trim()) return shops
    const needle = search.trim().toLowerCase()
    return shops.filter((s) =>
      s.name.toLowerCase().includes(needle) ||
      s.handle.toLowerCase().includes(needle) ||
      (s.email ?? "").toLowerCase().includes(needle)
    )
  }, [shops, search])

  const handleDelete = async (shop: BottleShop) => {
    if (!window.confirm(`Delete "${shop.name}"? Products linked to it via metadata.bottle_shop_id will lose their supplier reference.`)) return
    try {
      const res = await fetch(`/admin/bottle-shops/${shop.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShops((prev) => prev.filter((s) => s.id !== shop.id))
    } catch (err: any) {
      window.alert(`Delete failed: ${err?.message ?? err}`)
    }
  }

  const handleToggle = async (shop: BottleShop) => {
    const next = !shop.is_active
    setShops((prev) =>
      prev.map((s) => (s.id === shop.id ? { ...s, is_active: next } : s))
    )
    try {
      const res = await fetch(`/admin/bottle-shops/${shop.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: next }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, is_active: shop.is_active } : s))
      )
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between">
        <div>
          <Heading level="h1" className="flex items-center">
            Bottle shops
            <HelpTooltip
              text={{
                title: "Bottle shops",
                body: "Partners who supply branded spirit bottles (CÎROC, Patron, etc.). Each bottle product on the storefront is tied to one bottle shop via metadata.bottle_shop_id. When an order containing a bottle is placed, the 'Send to bottle shop' widget on the order detail emails the shop with the line items + ship-to address (SC Prints workshop).",
                bullets: [
                  "Handle is used as a stable filter key in admin and reports.",
                  "Email is required to use the 'Send to bottle shop' button — leave empty and the button is disabled.",
                  "Inactive shops are hidden from the per-product picker but remain linked to historical orders.",
                ],
              }}
            />
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Partner shops supplying branded spirit bottles for the customizer.
            Orders dropship-style via email.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="secondary" onClick={load} disabled={loading}>
            <ArrowPath className="mr-1" /> Refresh
          </Button>
          <Button size="small" onClick={() => { setEditShop(null); setDrawerOpen(true) }}>
            <Plus className="mr-1" /> New bottle shop
          </Button>
        </div>
      </Container>

      <Container className="p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search by name, handle, or email…"
          size="small"
        />
      </Container>

      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">Failed to load bottle shops: {error}</Text>
        </Container>
      ) : null}

      {!loading && shops.length === 0 && !error ? (
        <Container className="flex flex-col items-center gap-y-3 py-12">
          <Text className="text-ui-fg-muted">No bottle shops yet.</Text>
          <Button size="small" onClick={() => { setEditShop(null); setDrawerOpen(true) }}>
            <Plus className="mr-1" /> Create your first bottle shop
          </Button>
        </Container>
      ) : null}

      {filtered.length > 0 ? (
        <Container className="p-0 overflow-hidden">
          {filtered.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center gap-x-4 px-4 py-3 border-b border-ui-border-base last:border-b-0 hover:bg-ui-bg-subtle/30 transition"
            >
              <div className="shrink-0">
                <Switch checked={shop.is_active} onCheckedChange={() => handleToggle(shop)} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <Text size="small" className="font-medium truncate">{shop.name}</Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  /{shop.handle}
                  {shop.email ? ` · ${shop.email}` : " · no email"}
                  {shop.city ? ` · ${shop.city}${shop.state ? `, ${shop.state}` : ""}` : ""}
                </Text>
              </div>
              <div className="hidden md:flex shrink-0 w-32 justify-end">
                {shop.email ? (
                  <Badge size="2xsmall" color="green">ready</Badge>
                ) : (
                  <Badge size="2xsmall" color="orange">needs email</Badge>
                )}
              </div>
              <div className="flex items-center gap-x-1 shrink-0">
                <Button size="small" variant="transparent" onClick={() => { setEditShop(shop); setDrawerOpen(true) }}>
                  <PencilSquare />
                </Button>
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => handleDelete(shop)}
                  className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                >
                  <Trash />
                </Button>
              </div>
            </div>
          ))}
        </Container>
      ) : null}

      <BottleShopDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editShop={editShop}
        onSaved={load}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bottle shops",
  icon: BuildingStorefront,
})

export default BottleShopsPage
