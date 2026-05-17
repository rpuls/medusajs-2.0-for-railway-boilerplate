import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type Item = {
  id: string
  title: string
  description: string | null
  image_url: string
  order_id: string | null
  product_ids: { ids?: string[] }
  tags: { values?: string[] }
  attribution: string | null
  is_published: boolean
  weight: number
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const v = r.result
      if (typeof v === "string") resolve(v)
      else reject(new Error("FileReader returned non-string"))
    }
    r.onerror = reject
    r.readAsDataURL(file)
  })

const LookbookPage = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Create form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tagsCsv, setTagsCsv] = useState("")
  const [attribution, setAttribution] = useState("")
  const [orderId, setOrderId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/lookbook?include_unpublished=true", {
        credentials: "include",
      })
      const json = (await res.json()) as { items?: Item[] }
      setItems(json.items ?? [])
    } catch {
      toast.error("Failed to load lookbook")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Title required")
      return
    }
    if (!file) {
      toast.error("Pick an image")
      return
    }
    setSaving(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      const res = await fetch("/admin/lookbook", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          attribution: attribution.trim() || undefined,
          order_id: orderId.trim() || undefined,
          tags: tagsCsv
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          image_data_base64: dataUrl,
          image_filename: file.name,
          image_mime_type: file.type,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Saved")
      setOpen(false)
      setTitle("")
      setDescription("")
      setTagsCsv("")
      setAttribution("")
      setOrderId("")
      setFile(null)
      await load()
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = async (item: Item) => {
    try {
      await fetch(`/admin/lookbook/${item.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !item.is_published }),
      })
      await load()
    } catch {
      toast.error("Update failed")
    }
  }

  const remove = async (item: Item) => {
    if (!confirm("Delete this lookbook tile?")) return
    try {
      await fetch(`/admin/lookbook/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      await load()
    } catch {
      toast.error("Delete failed")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Lookbook
          <HelpTooltip
            text={{
              title: "Lookbook (public gallery)",
              body: "Curated photos of real SC PRINTS jobs, rendered as a Pinterest-style grid on /lookbook. Use it to soft-sell the outcome (a tagged hoodie on a real player) rather than the blank.",
              bullets: [
                "Each tile has a title, photo, optional description + attribution.",
                "Tag tiles by theme (sports, corporate, school, embroidery) — the public page shows tags as filter chips.",
                "Toggle Published to hide a tile without deleting it.",
                "Weight controls order (lower = earlier); 0 is the default. Drag-reorder is a follow-up.",
                "Linking a tile to an order or product IDs unlocks future deep-link CTAs from the lookbook.",
              ],
            }}
          />
        </Heading>
        <div className="flex items-center gap-x-2">
          <Badge color="blue">{items.length} tiles</Badge>
          <Button size="small" onClick={() => setOpen((v) => !v)}>
            {open ? "Cancel" : "New tile"}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="px-6 py-4 grid grid-cols-1 small:grid-cols-2 gap-3 border-b border-ui-border-base">
          <div>
            <Label size="xsmall">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Marrickville Lions 2026 hoodies"
            />
          </div>
          <div>
            <Label size="xsmall">Attribution</Label>
            <Input
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="Photo by …"
            />
          </div>
          <div className="small:col-span-2">
            <Label size="xsmall">Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label size="xsmall">Tags (comma separated)</Label>
            <Input
              value={tagsCsv}
              onChange={(e) => setTagsCsv(e.target.value)}
              placeholder="sports, hoodie, embroidery"
            />
          </div>
          <div>
            <Label size="xsmall">Order ID (optional)</Label>
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ord_..."
            />
          </div>
          <div className="small:col-span-2">
            <Label size="xsmall">Image *</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <div className="small:col-span-2 flex justify-end">
            <Button size="small" onClick={submit} disabled={saving}>
              Save tile
            </Button>
          </div>
        </div>
      ) : null}

      <div className="px-6 py-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : items.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No tiles yet. Click <em>New tile</em> to add the first one.
          </Text>
        ) : (
          <ul className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-ui-border-base bg-ui-bg-base overflow-hidden"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <Text weight="plus" size="small" className="truncate">
                      {item.title}
                    </Text>
                    {item.is_published ? (
                      <Badge color="green">On</Badge>
                    ) : (
                      <Badge color="grey">Off</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      className="text-ui-fg-base underline"
                    >
                      {item.is_published ? "Hide" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

// Page is now embedded as "Lookbook" tab in Studio & Lookbook;
// direct URL /app/lookbook still works for deep links

export default LookbookPage
