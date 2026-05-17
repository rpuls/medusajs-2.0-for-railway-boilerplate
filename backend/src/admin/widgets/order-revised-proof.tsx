import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useCallback, useEffect, useRef, useState } from "react"
import type { RevisedProof } from "../../api/admin/orders/[id]/revised-proof/route"

const adminPath = (orderId: string) => `/admin/orders/${orderId}/revised-proof`

const formatDate = (iso: string): string => {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return "—"
  return new Date(ts).toLocaleString()
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const OrderRevisedProofWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [proofs, setProofs] = useState<RevisedProof[]>(() => {
    const meta = (data?.metadata ?? {}) as Record<string, unknown>
    return Array.isArray(meta.revised_proofs) ? (meta.revised_proofs as RevisedProof[]) : []
  })
  const [uploading, setUploading] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Keep proofs in sync if the widget remounts with fresh order data
  useEffect(() => {
    const meta = (data?.metadata ?? {}) as Record<string, unknown>
    if (Array.isArray(meta.revised_proofs)) {
      setProofs(meta.revised_proofs as RevisedProof[])
    }
  }, [data?.metadata])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !orderId) return
      e.target.value = ""

      setUploading(true)
      setError(null)
      try {
        const dataUrl = await fileToBase64(file)
        const res = await fetch(adminPath(orderId), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mime_type: file.type || "image/jpeg",
            data_base64: dataUrl,
            note: note.trim() || undefined,
          }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(body?.error ?? `HTTP ${res.status}`)
        }
        setProofs(body.proofs ?? [])
        setNote("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
      }
    },
    [orderId, note]
  )

  const handleDelete = useCallback(
    async (proofId: string) => {
      if (!orderId) return
      setDeletingId(proofId)
      setError(null)
      try {
        const res = await fetch(`${adminPath(orderId)}?id=${encodeURIComponent(proofId)}`, {
          method: "DELETE",
          credentials: "include",
          headers: { Accept: "application/json" },
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
        setProofs(body.proofs ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed")
      } finally {
        setDeletingId(null)
      }
    },
    [orderId]
  )

  if (!orderId) return null

  const latest = proofs.length > 0 ? proofs[proofs.length - 1] : null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Revised proof</Heading>
        {latest && (
          <span className="text-xsmall text-ui-fg-subtle">
            {proofs.length} uploaded
          </span>
        )}
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-3">
        <Text size="small" className="text-ui-fg-subtle">
          Upload a revised proof to send to the customer. The approval page and
          next artwork email will show this instead of the auto-generated mockup.
        </Text>

        {latest && (
          <div className="rounded-md overflow-hidden border border-ui-border-base">
            <img
              src={latest.url}
              alt="Latest revised proof"
              className="w-full object-contain max-h-64 bg-ui-bg-subtle"
            />
            <div className="px-3 py-2 bg-ui-bg-base flex items-center justify-between gap-x-2">
              <div className="min-w-0">
                <Text size="xsmall" weight="plus" className="truncate">
                  {latest.filename}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {formatDate(latest.uploaded_at)}
                </Text>
                {latest.note && (
                  <Text size="xsmall" className="text-ui-fg-subtle italic mt-0.5">
                    {latest.note}
                  </Text>
                )}
              </div>
              <Button
                size="small"
                variant="transparent"
                className="text-ui-fg-error hover:text-ui-fg-error shrink-0"
                disabled={deletingId === latest.id}
                onClick={() => handleDelete(latest.id)}
              >
                {deletingId === latest.id ? "Removing…" : "Remove"}
              </Button>
            </div>
          </div>
        )}

        {proofs.length > 1 && (
          <details className="text-xsmall text-ui-fg-subtle">
            <summary className="cursor-pointer select-none">
              {proofs.length - 1} earlier {proofs.length - 1 === 1 ? "proof" : "proofs"}
            </summary>
            <ul className="mt-2 flex flex-col gap-y-1 pl-2">
              {[...proofs]
                .slice(0, -1)
                .reverse()
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-x-2">
                    <span className="truncate">{p.filename} · {formatDate(p.uploaded_at)}</span>
                    <button
                      type="button"
                      className="text-ui-fg-error hover:underline shrink-0 disabled:opacity-50"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                    >
                      {deletingId === p.id ? "…" : "Remove"}
                    </button>
                  </li>
                ))}
            </ul>
          </details>
        )}

        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            Note (optional)
          </Text>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Adjusted font size, shifted logo 5mm left"
            disabled={uploading}
            className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-small text-ui-fg-base placeholder:text-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive disabled:opacity-60"
          />
        </div>

        {error && (
          <Text size="xsmall" className="text-ui-fg-error">
            {error}
          </Text>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="secondary"
          size="small"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : latest ? "Upload revised proof" : "Upload proof"}
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderRevisedProofWidget, "order-revised-proof")
