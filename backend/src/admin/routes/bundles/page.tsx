import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
} from "@medusajs/ui"
import { ArrowPath, Plus, PencilSquare, Trash, ShoppingCart } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { HelpTooltip } from "../../components/reports/help-tooltip"
import { slugifyBundleHandle } from "../../lib/bundle-handle"

type BundleItem = {
  id: string
  bundle_id: string
  product_handle: string
  label: string
  quantity_per_unit: number
  decoration_type: "embroidery" | "print" | "none"
  position: number
}

type Bundle = {
  id: string
  title: string
  handle: string
  subtitle: string | null
  status: "active" | "draft"
  thumbnail_url: string | null
  quantity_multiplier_label: string | null
  items: BundleItem[]
  created_at: string
  updated_at: string
}

type ItemDraft = {
  product_handle: string
  label: string
  quantity_per_unit: number
  decoration_type: "embroidery" | "print" | "none"
  position: number
}

type BundleDraft = {
  title: string
  handle: string
  subtitle: string
  status: "active" | "draft"
  thumbnail_url: string
  quantity_multiplier_label: string
  items: ItemDraft[]
}

const BLANK_ITEM: ItemDraft = {
  product_handle: "",
  label: "",
  quantity_per_unit: 1,
  decoration_type: "embroidery",
  position: 0,
}

const BLANK_DRAFT: BundleDraft = {
  title: "",
  handle: "",
  subtitle: "",
  status: "active",
  thumbnail_url: "",
  quantity_multiplier_label: "",
  items: [],
}

const bundleToDraft = (bundle: Bundle): BundleDraft => ({
  title: bundle.title,
  handle: bundle.handle,
  subtitle: bundle.subtitle ?? "",
  status: bundle.status,
  thumbnail_url: bundle.thumbnail_url ?? "",
  quantity_multiplier_label: bundle.quantity_multiplier_label ?? "",
  items: (bundle.items ?? [])
    .sort((a, b) => a.position - b.position)
    .map((i) => ({
      product_handle: i.product_handle,
      label: i.label,
      quantity_per_unit: i.quantity_per_unit,
      decoration_type: i.decoration_type,
      position: i.position,
    })),
})

const draftToPayload = (draft: BundleDraft) => ({
  title: draft.title.trim(),
  handle: draft.handle.trim() || undefined,
  subtitle: draft.subtitle.trim() || null,
  status: draft.status,
  thumbnail_url: draft.thumbnail_url.trim() || null,
  quantity_multiplier_label: draft.quantity_multiplier_label.trim() || null,
  items: draft.items.map((item, idx) => ({
    product_handle: item.product_handle.trim(),
    label: item.label.trim(),
    quantity_per_unit: item.quantity_per_unit,
    decoration_type: item.decoration_type,
    position: idx,
  })),
})

const ItemRow = ({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: ItemDraft
  index: number
  onChange: (updated: ItemDraft) => void
  onRemove: () => void
}) => (
  <div className="flex flex-col gap-y-2 p-3 border border-ui-border-base rounded-md bg-ui-bg-subtle/30">
    <div className="flex items-center justify-between">
      <Text size="xsmall" className="text-ui-fg-muted font-medium">
        Item {index + 1}
      </Text>
      <Button size="small" variant="transparent" onClick={onRemove} className="text-ui-fg-muted hover:text-ui-tag-red-icon">
        <Trash />
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-y-1">
        <Label className="text-xs">Product handle *</Label>
        <Input
          size="small"
          value={item.product_handle}
          onChange={(e) => onChange({ ...item, product_handle: e.currentTarget.value })}
          placeholder="e.g. as-colour-5001"
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <Label className="text-xs">Label *</Label>
        <Input
          size="small"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.currentTarget.value })}
          placeholder="e.g. Hi-Vis polo shirts"
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <Label className="text-xs">Qty per unit</Label>
        <Input
          size="small"
          type="number"
          min={1}
          value={item.quantity_per_unit}
          onChange={(e) =>
            onChange({
              ...item,
              quantity_per_unit: Math.max(1, parseInt(e.currentTarget.value) || 1),
            })
          }
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <Label className="text-xs">Decoration</Label>
        <Select
          value={item.decoration_type}
          onValueChange={(v) =>
            onChange({ ...item, decoration_type: v as ItemDraft["decoration_type"] })
          }
        >
          <Select.Trigger size="small">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="embroidery">Embroidery</Select.Item>
            <Select.Item value="print">Print</Select.Item>
            <Select.Item value="none">None</Select.Item>
          </Select.Content>
        </Select>
      </div>
    </div>
  </div>
)

const BundleFormDrawer = ({
  open,
  onClose,
  editBundle,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editBundle: Bundle | null
  onSaved: () => void
}) => {
  const [draft, setDraft] = useState<BundleDraft>(BLANK_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(editBundle ? bundleToDraft(editBundle) : { ...BLANK_DRAFT, items: [] })
      setError(null)
    }
  }, [open, editBundle])

  useEffect(() => {
    if (!editBundle && draft.title && !draft.handle) {
      setDraft((d) => ({ ...d, handle: slugifyBundleHandle(d.title) }))
    }
  }, [draft.title, draft.handle, editBundle])

  const addItem = () => {
    setDraft((d) => ({
      ...d,
      items: [...d.items, { ...BLANK_ITEM, position: d.items.length }],
    }))
  }

  const updateItem = (idx: number, updated: ItemDraft) => {
    setDraft((d) => {
      const items = [...d.items]
      items[idx] = updated
      return { ...d, items }
    })
  }

  const removeItem = (idx: number) => {
    setDraft((d) => ({
      ...d,
      items: d.items.filter((_, i) => i !== idx),
    }))
  }

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("Bundle title is required.")
      return
    }
    for (let i = 0; i < draft.items.length; i++) {
      const item = draft.items[i]
      if (!item.product_handle.trim()) {
        setError(`Item ${i + 1}: product handle is required.`)
        return
      }
      if (!item.label.trim()) {
        setError(`Item ${i + 1}: label is required.`)
        return
      }
    }
    setSaving(true)
    setError(null)
    try {
      const url = editBundle
        ? `/admin/bundles/${editBundle.id}`
        : "/admin/bundles"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draftToPayload(draft)),
      })
      const json = await res.json()
      if (!res.ok)
        throw new Error(json?.message ?? json?.error ?? `HTTP ${res.status}`)
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
      <Drawer.Content className="max-w-xl">
        <Drawer.Header>
          <Drawer.Title>
            {editBundle ? "Edit bundle" : "New bundle"}
          </Drawer.Title>
          <Drawer.Description>
            Bundles appear on the storefront /bundles page with a step-by-step
            configuration wizard.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="overflow-auto">
          <div className="flex flex-col gap-y-4 p-1">
            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Title *</Label>
              <Input
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.currentTarget.value }))
                }
                placeholder="e.g. Site Ready Starter Pack"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Handle</Label>
              <Input
                value={draft.handle}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, handle: e.currentTarget.value }))
                }
                placeholder="auto-derived from title if blank"
              />
              <Text size="xsmall" className="text-ui-fg-muted">
                URL slug used in /bundles/[handle]. Avoid changing after launch.
              </Text>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Subtitle (angle copy)</Label>
              <Textarea
                value={draft.subtitle}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, subtitle: e.currentTarget.value }))
                }
                placeholder='e.g. "Everything your new tradie needs, sorted before their first day."'
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Thumbnail URL</Label>
              <Input
                value={draft.thumbnail_url}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    thumbnail_url: e.currentTarget.value,
                  }))
                }
                placeholder="https://cdn.example.com/bundle-hero.jpg"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label className="text-xs">Crew multiplier label</Label>
              <Input
                value={draft.quantity_multiplier_label}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    quantity_multiplier_label: e.currentTarget.value,
                  }))
                }
                placeholder='e.g. "How many crew members?" — leave blank for fixed packs'
              />
              <Text size="xsmall" className="text-ui-fg-muted">
                When set, the wizard shows a &ldquo;How many X?&rdquo; step and
                multiplies all item quantities by the answer.
              </Text>
            </div>

            <div className="flex items-center gap-x-2">
              <Switch
                id="bundle-active"
                checked={draft.status === "active"}
                onCheckedChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    status: v ? "active" : "draft",
                  }))
                }
              />
              <Label htmlFor="bundle-active" className="text-sm">
                Active
              </Label>
              <Text size="xsmall" className="text-ui-fg-muted ml-2">
                Inactive bundles are hidden from the storefront.
              </Text>
            </div>

            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Bundle items</Label>
                <Button size="small" variant="secondary" onClick={addItem}>
                  <Plus className="mr-1" /> Add item
                </Button>
              </div>
              {draft.items.length === 0 ? (
                <Text size="xsmall" className="text-ui-fg-muted">
                  No items yet. Click &ldquo;Add item&rdquo; to start building
                  the pack.
                </Text>
              ) : (
                <div className="flex flex-col gap-y-2">
                  {draft.items.map((item, idx) => (
                    <ItemRow
                      key={idx}
                      item={item}
                      index={idx}
                      onChange={(updated) => updateItem(idx, updated)}
                      onRemove={() => removeItem(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {error ? (
              <Text size="small" className="text-ui-tag-red-icon">
                {error}
              </Text>
            ) : null}
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={saving}>
            {editBundle ? "Save changes" : "Create bundle"}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

const BundleRow = ({
  bundle,
  onEdit,
  onDelete,
}: {
  bundle: Bundle
  onEdit: () => void
  onDelete: () => void
}) => (
  <div className="flex items-center gap-x-4 px-4 py-3 border-b border-ui-border-base last:border-b-0 hover:bg-ui-bg-subtle/30 transition">
    <div className="flex flex-col flex-1 min-w-0">
      <Text size="small" className="font-medium truncate">
        {bundle.title}
      </Text>
      <Text size="xsmall" className="text-ui-fg-muted">
        /{bundle.handle} · {bundle.items?.length ?? 0} item
        {(bundle.items?.length ?? 0) !== 1 ? "s" : ""}
        {bundle.quantity_multiplier_label
          ? ` · crew: "${bundle.quantity_multiplier_label}"`
          : ""}
      </Text>
    </div>
    <div className="shrink-0">
      <Badge
        size="2xsmall"
        color={bundle.status === "active" ? "green" : "grey"}
      >
        {bundle.status}
      </Badge>
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

const BundlesPage = () => {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editBundle, setEditBundle] = useState<Bundle | null>(null)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/admin/bundles", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setBundles(data.bundles ?? [])
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (!search.trim()) return bundles
    const needle = search.trim().toLowerCase()
    return bundles.filter(
      (b) =>
        b.title.toLowerCase().includes(needle) ||
        b.handle.toLowerCase().includes(needle)
    )
  }, [bundles, search])

  const handleDelete = async (bundle: Bundle) => {
    if (
      !window.confirm(
        `Delete "${bundle.title}"? This cannot be undone.`
      )
    )
      return
    try {
      const res = await fetch(`/admin/bundles/${bundle.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setBundles((prev) => prev.filter((b) => b.id !== bundle.id))
    } catch (err: any) {
      window.alert(`Delete failed: ${err?.message ?? err}`)
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between">
        <div>
          <Heading level="h1" className="flex items-center">
            Bundles
            <HelpTooltip
              text={{
                title: "Bundles",
                body: "Pre-configured uniform packs (e.g. Site Ready Starter Pack, Full Crew Bundle) that appear on the storefront /bundles page. Each bundle guides customers through a step-by-step wizard: pick colours and sizes per item, upload artwork, leave decoration notes, then add the whole pack to cart.",
                bullets: [
                  "Title + handle: The handle becomes the URL (/bundles/[handle]) — avoid changing after launch.",
                  "Subtitle: The angle/pitch shown in quotes on the bundle page (e.g. \"Everything your new tradie needs, sorted before their first day.\").",
                  "Crew multiplier: Set the label (e.g. \"How many crew members?\") to make the wizard ask for a number and multiply all item quantities by it. Leave blank for fixed packs.",
                  "Items: Each item is a Medusa product (referenced by handle), the per-unit quantity, and the decoration type. The label is what the customer sees.",
                  "Status: Inactive bundles are hidden from the storefront but kept here for editing.",
                  "Cart lines: When a customer checks out a bundle, each garment is a separate cart line tagged with bundle_id and decoration notes for staff to follow up on pricing.",
                ],
              }}
            />
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Pre-configured uniform packs shown on the storefront /bundles page.
            Each bundle guides customers through a step-by-step configuration
            wizard.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={load}
            disabled={loading}
          >
            <ArrowPath className="mr-1" /> Refresh
          </Button>
          <Button
            size="small"
            onClick={() => {
              setEditBundle(null)
              setDrawerOpen(true)
            }}
          >
            <Plus className="mr-1" /> New bundle
          </Button>
        </div>
      </Container>

      <Container className="p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search by title or handle…"
          size="small"
        />
      </Container>

      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">
            Failed to load bundles: {error}
          </Text>
        </Container>
      ) : null}

      {!loading && bundles.length === 0 && !error ? (
        <Container className="flex flex-col items-center gap-y-3 py-12">
          <Text className="text-ui-fg-muted">No bundles yet.</Text>
          <Button
            size="small"
            onClick={() => {
              setEditBundle(null)
              setDrawerOpen(true)
            }}
          >
            <Plus className="mr-1" /> Create your first bundle
          </Button>
        </Container>
      ) : null}

      {filtered.length > 0 ? (
        <Container className="p-0 overflow-hidden">
          {filtered.map((bundle) => (
            <BundleRow
              key={bundle.id}
              bundle={bundle}
              onEdit={() => {
                setEditBundle(bundle)
                setDrawerOpen(true)
              }}
              onDelete={() => handleDelete(bundle)}
            />
          ))}
        </Container>
      ) : null}

      <BundleFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editBundle={editBundle}
        onSaved={load}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bundles",
  icon: ShoppingCart,
})

export default BundlesPage
