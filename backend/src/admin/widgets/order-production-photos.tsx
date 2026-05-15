import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useRef, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type ProductionPhoto = {
  id: string
  url: string
  filename: string
  mime_type: string
  caption?: string | null
  uploaded_at: string
  uploaded_by?: string | null
}

const MAX_FILE_BYTES = 8 * 1024 * 1024

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") resolve(result)
      else reject(new Error("FileReader returned non-string result"))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const OrderProductionPhotosWidget = ({
  data: order,
}: {
  data: { id: string }
}) => {
  const orderId = order?.id
  const [photos, setPhotos] = useState<ProductionPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/production-photos`, {
        credentials: "include",
      })
      const json = (await res.json()) as { photos?: ProductionPhoto[] }
      setPhotos(json.photos ?? [])
    } catch {
      // soft failure — empty list
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const onUpload = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Photo exceeds 8 MB limit")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are accepted")
      return
    }
    setUploading(true)
    try {
      const dataUrl = await fileToBase64(file)
      const res = await fetch(`/admin/orders/${orderId}/production-photos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mime_type: file.type,
          data_base64: dataUrl,
          caption: caption.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.error || `Upload failed (${res.status})`)
      }
      const json = (await res.json()) as { photos?: ProductionPhoto[] }
      setPhotos(json.photos ?? [])
      setCaption("")
      toast.success("Photo uploaded")
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return
    try {
      const res = await fetch(
        `/admin/orders/${orderId}/production-photos?id=${encodeURIComponent(id)}`,
        { method: "DELETE", credentials: "include" }
      )
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as { photos?: ProductionPhoto[] }
      setPhotos(json.photos ?? [])
    } catch (err: any) {
      toast.error(err?.message ?? "Delete failed")
    }
  }

  if (!orderId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Production photos
          <HelpTooltip
            text={{
              title: "Production photos",
              body: "Snap a phone photo from the press or embroidery machine while the order is in production. The most recently uploaded photo is included in the customer's next 'in production' email — they see exactly what their gear looks like coming off the press.",
              bullets: [
                "Max 8 MB per photo — phone defaults are usually fine.",
                "Only image files (JPEG, PNG, WEBP).",
                "Captions are optional; they appear under the photo in the customer email.",
                "Delete is permanent — the file stays in MinIO but is unlinked from the order.",
              ],
            }}
          />
        </Heading>
        <Badge color={photos.length > 0 ? "green" : "grey"}>
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </Badge>
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-4">
        <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-3 flex flex-col gap-y-2">
          <Input
            placeholder="Caption (optional) — included in the customer email"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
          />
          <div className="flex items-center justify-between gap-x-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(file)
              }}
              className="text-sm text-ui-fg-base"
            />
            {uploading ? (
              <Badge color="blue">Uploading…</Badge>
            ) : null}
          </div>
        </div>

        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : photos.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No photos yet. Upload a shot of the job in production — the customer's next stage email will include it.
          </Text>
        ) : (
          <ul className="grid grid-cols-2 small:grid-cols-3 gap-3">
            {photos.map((p) => (
              <li
                key={p.id}
                className="rounded-md border border-ui-border-base bg-ui-bg-base overflow-hidden"
              >
                <img
                  src={p.url}
                  alt={p.caption ?? p.filename}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 flex items-start justify-between gap-x-2">
                  <div className="flex flex-col min-w-0">
                    {p.caption ? (
                      <Text size="xsmall" className="truncate">
                        {p.caption}
                      </Text>
                    ) : null}
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {new Date(p.uploaded_at).toLocaleDateString("en-AU", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                    aria-label="Delete photo"
                  >
                    <Trash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default withWidgetBoundary(
  OrderProductionPhotosWidget,
  "order-production-photos"
)
