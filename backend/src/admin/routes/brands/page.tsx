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
import { ArrowPath, Plus, PencilSquare, Trash, Tag } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  BrandPicker,
  invalidateBrandPickerCache,
} from "../../components/brands/brand-picker"

type Brand = {
  id: string
  name: string
  handle: string
  description: string | null
  logo_url: string | null
  external_code: string | null
  parent_id: string | null
  is_active: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

type BrandDraft = {
  name: string
  handle: string
  description: string
  logo_url: string
  external_code: string
  parent_id: string | null
  is_active: boolean
}

const BLANK_DRAFT: BrandDraft = {
  name: "",
  handle: "",
  description: "",
  logo_url: "",
  external_code: "",
  parent_id: null,
  is_active: true,
}

const brandToDraft = (brand: Brand): BrandDraft => ({
  name: brand.name,
  handle: brand.handle,
  description: brand.description ?? "",
  logo_url: brand.logo_url ?? "",
  external_code: brand.external_code ?? "",
  parent_id: brand.parent_id,
  is_active: brand.is_active,
})

const draftToPayload = (draft: BrandDraft) => ({
  name: draft.name.trim(),
  handle: draft.handle.trim() || undefined,
  description: draft.description.trim() || null,
  logo_url: draft.logo_url.trim() || null,
  external_code: draft.external_code.trim() || null,
  parent_id: draft.parent_id,
  is_active: draft.is_active,
})

const BrandFormDrawer = ({
  open,
  onClose,
  editBrand,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editBrand: Brand | null
  onSaved: () => void
}) => {
  const [draft, setDraft] = useState<BrandDraft>(BLANK_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(editBrand ? brandToDraft(editBrand) : { ...BLANK_DRAFT })
      setError(null)
    }
  }, [open, editBrand])

  const submit = async () => {
    if (!draft.name.trim()) {
      setError("Brand name is required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const url = editBrand ? `/admin/brands/${editBrand.id}` : "/admin/brands"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draftToPayload(draft)),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message ?? json?.error ?? `HTTP ${res.status}`)
      invalidateBrandPickerCache()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Drawer.Content className="max-w-lg">
        <Drawer.Header>
          <Drawer.Title>{editBrand ? "Edit brand" : "New brand"}</Drawer.Title>
          <Drawer.Description>
            One Brand per product, optionally grouped under a parent (e.g. FashionBiz → Biz Care, Biz Collection, Syzmik).
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="overflow-auto">
          <div className="flex flex-col gap-y-4 p-1">
            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.currentTarget.value }))}
                placeholder="e.g. Biz Collection"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Handle</Label>
              <Input
                value={draft.handle}
                onChange={(e) => setDraft((d) => ({ ...d, handle: e.currentTarget.value }))}
                placeholder="auto-derived from name if blank"
              />
              <Text size="xsmall" className="text-ui-fg-muted">
                URL slug. Used in `/brands/&lt;handle&gt;` and as a stable filter key.
              </Text>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">External code</Label>
              <Input
                value={draft.external_code}
                onChange={(e) => setDraft((d) => ({ ...d, external_code: e.currentTarget.value }))}
                placeholder="e.g. BIZ, ASC, DNC"
              />
              <Text size="xsmall" className="text-ui-fg-muted">
                Optional short code used by the spreadsheet importer to resolve cells like "BIZ" to this brand.
              </Text>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Parent brand</Label>
              <BrandPicker
                value={draft.parent_id}
                onChange={(v) => setDraft((d) => ({ ...d, parent_id: v }))}
                excludeId={editBrand?.id}
                topLevelOnly
                allowNone
                placeholder="(None)"
              />
              <Text size="xsmall" className="text-ui-fg-muted">
                Optional. Only one level of nesting is supported.
              </Text>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.currentTarget.value }))}
                placeholder="Short description shown on the brand landing page."
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Logo URL</Label>
              <Input
                value={draft.logo_url}
                onChange={(e) => setDraft((d) => ({ ...d, logo_url: e.currentTarget.value }))}
                placeholder="https://cdn.example.com/logo.svg"
              />
            </div>

            <div className="flex items-center gap-x-2">
              <Switch
                id="brand-active"
                checked={draft.is_active}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, is_active: v }))}
              />
              <Label htmlFor="brand-active" className="text-sm">Active</Label>
              <Text size="xsmall" className="text-ui-fg-muted ml-2">
                Inactive brands stay in admin but are hidden from the storefront.
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
            {editBrand ? "Save changes" : "Create brand"}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const BrandRow = ({
  brand,
  parentName,
  childCount,
  onEdit,
  onDelete,
  onToggle,
}: {
  brand: Brand
  parentName: string | null
  childCount: number
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) => (
  <div className="flex items-center gap-x-4 px-4 py-3 border-b border-ui-border-base last:border-b-0 hover:bg-ui-bg-subtle/30 transition">
    <div className="shrink-0">
      <Switch checked={brand.is_active} onCheckedChange={onToggle} />
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <Text size="small" className="font-medium truncate">{brand.name}</Text>
      <Text size="xsmall" className="text-ui-fg-muted">
        /{brand.handle}
        {brand.external_code ? ` · code ${brand.external_code}` : ""}
        {parentName ? ` · under ${parentName}` : ""}
        {childCount > 0 ? ` · ${childCount} sub-brand${childCount > 1 ? "s" : ""}` : ""}
      </Text>
    </div>
    <div className="hidden md:flex shrink-0 w-32 justify-end">
      {brand.parent_id === null && childCount === 0 ? (
        <Badge size="2xsmall">leaf</Badge>
      ) : brand.parent_id === null ? (
        <Badge size="2xsmall" color="purple">parent</Badge>
      ) : (
        <Badge size="2xsmall" color="blue">child</Badge>
      )}
    </div>
    <div className="flex items-center gap-x-1 shrink-0">
      <Button size="small" variant="transparent" onClick={onEdit}>
        <PencilSquare />
      </Button>
      <Button
        size="small"
        variant="transparent"
        onClick={onDelete}
        className="text-ui-fg-muted hover:text-ui-tag-red-icon"
      >
        <Trash />
      </Button>
    </div>
  </div>
)

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/admin/brands?limit=500", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setBrands(data.brands ?? [])
      invalidateBrandPickerCache()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const childCountByParent = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of brands) {
      if (b.parent_id) map.set(b.parent_id, (map.get(b.parent_id) ?? 0) + 1)
    }
    return map
  }, [brands])

  const nameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const b of brands) map.set(b.id, b.name)
    return map
  }, [brands])

  const filtered = useMemo(() => {
    if (!search.trim()) return brands
    const needle = search.trim().toLowerCase()
    return brands.filter((b) =>
      b.name.toLowerCase().includes(needle) ||
      b.handle.toLowerCase().includes(needle) ||
      (b.external_code ?? "").toLowerCase().includes(needle)
    )
  }, [brands, search])

  const handleDelete = async (brand: Brand) => {
    const childCount = childCountByParent.get(brand.id) ?? 0
    if (childCount > 0) {
      window.alert(
        `"${brand.name}" has ${childCount} sub-brand(s). Reparent or delete them before deleting this brand.`
      )
      return
    }
    if (!window.confirm(`Delete "${brand.name}"? Any products linked to it will become brand-less.`)) {
      return
    }
    try {
      const res = await fetch(`/admin/brands/${brand.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setBrands((prev) => prev.filter((b) => b.id !== brand.id))
      invalidateBrandPickerCache()
    } catch (err: any) {
      window.alert(`Delete failed: ${err?.message ?? err}`)
    }
  }

  const handleToggle = async (brand: Brand) => {
    const next = !brand.is_active
    setBrands((prev) =>
      prev.map((b) => (b.id === brand.id ? { ...b, is_active: next } : b))
    )
    try {
      const res = await fetch(`/admin/brands/${brand.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: next }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      invalidateBrandPickerCache()
    } catch {
      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, is_active: brand.is_active } : b))
      )
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between">
        <div>
          <Heading level="h1" className="flex items-center">
            Brands
            <HelpTooltip
              text={{
                title: "Brands",
                body: "Single source of truth for every supplier/brand identity in the catalog. Products are linked to a brand via the spreadsheet importer or the product detail widget. The storefront /brands pages read directly from this list.",
                bullets: [
                  "Hierarchy: one level of parent → child (e.g. FashionBiz → Biz Collection). Set parent_id in the edit drawer.",
                  "Handle is used in storefront URLs (/brands/[handle]) — changing it after launch breaks links.",
                  "External code is matched case-insensitively by the spreadsheet importer; missing brands are auto-created.",
                  "Inactive brands are hidden from the storefront but remain linked to existing products for reporting.",
                ],
              }}
            />
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Canonical brand list. Linked to products via the spreadsheet importer
            and the product detail widget. Storefront `/brands` reads from this
            list directly.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="secondary" onClick={load} disabled={loading}>
            <ArrowPath className="mr-1" /> Refresh
          </Button>
          <Button size="small" onClick={() => { setEditBrand(null); setDrawerOpen(true) }}>
            <Plus className="mr-1" /> New brand
          </Button>
        </div>
      </Container>

      <Container className="p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search by name, handle, or external code…"
          size="small"
        />
      </Container>

      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">Failed to load brands: {error}</Text>
        </Container>
      ) : null}

      {!loading && brands.length === 0 && !error ? (
        <Container className="flex flex-col items-center gap-y-3 py-12">
          <Text className="text-ui-fg-muted">No brands yet.</Text>
          <Button size="small" onClick={() => { setEditBrand(null); setDrawerOpen(true) }}>
            <Plus className="mr-1" /> Create your first brand
          </Button>
        </Container>
      ) : null}

      {filtered.length > 0 ? (
        <Container className="p-0 overflow-hidden">
          {filtered.map((brand) => (
            <BrandRow
              key={brand.id}
              brand={brand}
              parentName={brand.parent_id ? nameById.get(brand.parent_id) ?? null : null}
              childCount={childCountByParent.get(brand.id) ?? 0}
              onEdit={() => { setEditBrand(brand); setDrawerOpen(true) }}
              onDelete={() => handleDelete(brand)}
              onToggle={() => handleToggle(brand)}
            />
          ))}
        </Container>
      ) : null}

      <BrandFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editBrand={editBrand}
        onSaved={load}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
  icon: Tag,
})

export default BrandsPage
