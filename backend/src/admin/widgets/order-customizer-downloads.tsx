import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Button, Container, Heading, Select, Text } from "@medusajs/ui"
import { ChevronDown, XMark } from "@medusajs/icons"
import { useCallback, useEffect, useRef, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import type { RevisedProof } from "../../api/admin/orders/[id]/revised-proof/route"

function adminCustomizerDownloadPath(orderId: string) {
  return `/admin/orders/${orderId}/customizer-download`
}
function adminProofPath(orderId: string) {
  return `/admin/orders/${orderId}/revised-proof`
}

type ArtifactPayload = {
  side: string
  side_label: string
  print_url: string | null
  print_url_inline_omitted?: boolean
  mockup_url: string | null
  mockup_url_inline_omitted?: boolean
}

type LinePayload = {
  line_item_id: string
  product_title: string | null
  variant_title: string | null
  title: string | null
  quantity: number
  has_customizer: boolean
  print_notes: string | null
  artifacts: ArtifactPayload[]
  customer_original_files?: Array<{
    url: string
    file_name: string
    mime_type: string
  }>
  product_handle?: string | null
  variant_id?: string | null
}

type DownloadPayload = {
  order_id?: string
  lines?: LinePayload[]
}

function sideKey(lineItemId: string, side: string) {
  return `${lineItemId}:${side}`
}

function lineHeading(line: LinePayload) {
  const product = line.product_title || line.title || "Product"
  const variant =
    line.variant_title && typeof line.variant_title === "string" ? line.variant_title : null
  return variant ? `${product} · ${variant}` : product
}

function formatDate(iso: string): string {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return "—"
  return new Date(ts).toLocaleString()
}

// ─── Per-side mockup + proof history card ────────────────────────────────────

type SideProofCardProps = {
  orderId: string
  lineItemId: string
  art: ArtifactPayload
  proofsForSide: RevisedProof[]
  customerOriginalFileUrl?: string | null
  onProofsChange: (updated: RevisedProof[]) => void
  onCustomisePosition: ((artworkUrl: string | null) => void) | null
}

const SideProofCard = ({
  orderId,
  lineItemId,
  art,
  proofsForSide,
  customerOriginalFileUrl,
  onProofsChange,
  onCustomisePosition,
}: SideProofCardProps) => {
  const key = sideKey(lineItemId, art.side)

  // Default to latest proof, or "original"
  const [selected, setSelected] = useState<string>(
    proofsForSide.length > 0 ? proofsForSide[proofsForSide.length - 1].id : "original"
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Keep selected in sync when proofs reload
  useEffect(() => {
    setSelected(
      proofsForSide.length > 0 ? proofsForSide[proofsForSide.length - 1].id : "original"
    )
  }, [proofsForSide])

  const selectedProof = proofsForSide.find((p) => p.id === selected)

  // What mockup image to show (right column)
  const displayedMockupUrl =
    selected === "original"
      ? art.mockup_url
      : (selectedProof?.url ?? art.mockup_url)

  // What artwork to show (left column) — proof artwork_url, or original upload, or print PNG
  const displayedArtworkUrl =
    selected === "original"
      ? (customerOriginalFileUrl ?? art.print_url)
      : (selectedProof?.artwork_url ?? selectedProof?.url ?? customerOriginalFileUrl ?? art.print_url)

  // Artwork URL to pre-load into the customiser (latest proof artwork, or original upload, or print PNG)
  const artworkForCustomiser =
    selectedProof?.artwork_url ?? customerOriginalFileUrl ?? art.print_url ?? null

  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = useCallback(
    async (proofId: string) => {
      setDeletingId(proofId)
      setDeleteError(null)
      try {
        const res = await fetch(`${adminProofPath(orderId)}?id=${encodeURIComponent(proofId)}`, {
          method: "DELETE",
          credentials: "include",
          headers: { Accept: "application/json" },
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error ?? body?.message ?? `HTTP ${res.status}`)
        onProofsChange(body.proofs ?? [])
        setSelected("original")
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : "Delete failed")
      } finally {
        setDeletingId(null)
      }
    },
    [orderId, onProofsChange]
  )

  return (
    <li
      key={key}
      className="rounded-md bg-ui-bg-subtle px-3 py-2"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
        <Text size="xsmall" weight="plus">
          {art.side_label}
        </Text>
        {art.print_url_inline_omitted ? (
          <Badge size="2xsmall" color="orange">Print file too large (inline)</Badge>
        ) : null}
        {art.mockup_url_inline_omitted ? (
          <Badge size="2xsmall" color="orange">Mockup too large (inline)</Badge>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left column — artwork (upload or proof artwork) */}
        <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden flex flex-col">
          {displayedArtworkUrl ? (
            <img
              src={displayedArtworkUrl}
              alt={`Artwork ${art.side_label}`}
              className="mx-auto block max-h-48 w-auto object-contain bg-ui-bg-component p-2"
            />
          ) : (
            <div className="h-48 bg-ui-bg-component flex items-center justify-center">
              <Text size="xsmall" className="text-ui-fg-muted">No artwork</Text>
            </div>
          )}
          <div className="border-t border-ui-border-base px-3 py-2 flex flex-col gap-y-2 flex-1">
            <Text size="xsmall" className="text-ui-fg-subtle">
              {selected === "original" ? "Customer artwork / print file" : "Proof artwork"}
            </Text>
            {displayedArtworkUrl && (
              <a
                href={displayedArtworkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-small text-blue-600 hover:underline break-all"
              >
                Open artwork (right-click → Save as…)
              </a>
            )}

            {/* Customise position — single action, routes all proof creation through the iframe */}
            {onCustomisePosition ? (
              <div className="border-t border-ui-border-base pt-2 mt-auto">
                <Button
                  variant="secondary"
                  size="small"
                  className="w-full"
                  onClick={() => onCustomisePosition(artworkForCustomiser)}
                >
                  {proofsForSide.length > 0 ? "Customise proof position" : "Create revised proof"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right column — garment mockup + proof history */}
        {art.mockup_url || proofsForSide.length > 0 ? (
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden flex flex-col">
            {displayedMockupUrl ? (
              <img
                src={displayedMockupUrl}
                alt={`Garment preview ${art.side_label}`}
                className="mx-auto block max-h-48 w-auto object-contain bg-ui-bg-component p-2"
              />
            ) : (
              <div className="h-48 bg-ui-bg-component flex items-center justify-center">
                <Text size="xsmall" className="text-ui-fg-muted">No mockup</Text>
              </div>
            )}

            <div className="border-t border-ui-border-base px-3 py-2 flex flex-col gap-y-2 flex-1">
              {/* History dropdown — only when there are proofs */}
              {proofsForSide.length > 0 ? (
                <div className="flex items-center gap-x-2">
                  <div className="flex-1 min-w-0">
                    <Select
                      value={selected}
                      onValueChange={(v) => setSelected(v)}
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="original">Original mockup</Select.Item>
                        {[...proofsForSide].reverse().map((p) => (
                          <Select.Item key={p.id} value={p.id}>
                            {p.note ? `${p.note} · ` : ""}{formatDate(p.uploaded_at)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                  {selected !== "original" && (
                    <Button
                      size="small"
                      variant="transparent"
                      className="text-ui-fg-error hover:text-ui-fg-error shrink-0"
                      disabled={deletingId === selected}
                      onClick={() => handleDelete(selected)}
                    >
                      {deletingId === selected ? "Removing…" : "Remove"}
                    </Button>
                  )}
                </div>
              ) : null}
              {deleteError && (
                <Text size="xsmall" className="text-ui-fg-error">{deleteError}</Text>
              )}

              {/* Mockup label + download link */}
              <div>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {selected === "original" ? "Garment mockup (JPEG)" : "Revised mockup"}
                </Text>
                {displayedMockupUrl && (
                  <a
                    href={displayedMockupUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-small text-blue-600 hover:underline break-all"
                  >
                    Open {selected === "original" ? "mockup JPEG" : "revised mockup"} (right-click → Save as…)
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  )
}

// ─── Customiser iframe modal ──────────────────────────────────────────────────

type CustomiserModalProps = {
  src: string
  onClose: () => void
}

const CustomiserModal = ({ src, onClose }: CustomiserModalProps) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6"
    onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
  >
    <div className="flex flex-col w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl border border-ui-border-base"
      style={{ height: "90vh" }}
    >
      <div className="flex items-center justify-between bg-ui-bg-base px-4 py-2 border-b border-ui-border-base shrink-0">
        <Text size="small" weight="plus">Customise proof position — adjust artwork, then click Save Proof</Text>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 rounded px-2 py-1 text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle"
          aria-label="Close customiser"
        >
          <XMark />
          <span className="text-xsmall">Close</span>
        </button>
      </div>
      <iframe
        src={src}
        className="flex-1 w-full border-0 bg-white"
        allow="clipboard-read; clipboard-write"
        title="Customise proof position"
      />
    </div>
  </div>
)

// ─── Main widget ─────────────────────────────────────────────────────────────

const OrderCustomizerDownloadsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [payload, setPayload] = useState<DownloadPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(true)

  // All proofs for this order — grouped per side when rendering
  const [allProofs, setAllProofs] = useState<RevisedProof[]>(() => {
    const meta = (data?.metadata ?? {}) as Record<string, unknown>
    return Array.isArray(meta.revised_proofs) ? (meta.revised_proofs as RevisedProof[]) : []
  })

  // Storefront base URL + country code for building the customiser iframe URL
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState<string>("au")

  // Modal state — null = closed, string = customiser iframe src
  const [modalSrc, setModalSrc] = useState<string | null>(null)

  // Fetch scp-config once
  useEffect(() => {
    fetch("/admin/scp-config", { credentials: "include", headers: { Accept: "application/json" } })
      .then((r) => r.ok ? r.json() : null)
      .then((body) => {
        if (body?.storefront_url) {
          setStorefrontUrl(String(body.storefront_url).replace(/\/$/, ""))
          setCountryCode(String(body.country_code ?? "au"))
        }
      })
      .catch(() => { /* non-critical */ })
  }, [])

  // postMessage listener — receives proof-save events from the iframe
  useEffect(() => {
    if (!orderId) return
    const handler = async (event: MessageEvent) => {
      if (!event.data || event.data.type !== "ADMIN_PROOF_SAVED") return
      const { mockupUrl, artworkUrl, lineItemId, side } = event.data as {
        mockupUrl: string
        artworkUrl?: string | null
        lineItemId: string
        side: string
      }
      if (!mockupUrl || !lineItemId || !side) return

      // Save the proof via URL-only path
      try {
        const res = await fetch(adminProofPath(orderId), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            line_item_id: lineItemId,
            side,
            mockup_url: mockupUrl,
            artwork_url: artworkUrl ?? undefined,
          }),
        })
        const body = await res.json().catch(() => ({}))
        if (res.ok) {
          setAllProofs(body.proofs ?? [])
        }
      } catch { /* handled silently — user can verify the result */ }

      setModalSrc(null)
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [orderId])

  const downloadMockupPdf = useCallback(async () => {
    if (!orderId) return
    setPdfLoading(true)
    setPdfError(null)
    try {
      const res = await fetch(`/admin/orders/${orderId}/mockup-pdf`, {
        credentials: "include",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        throw new Error(body?.message || `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `artwork-approval-${data?.display_id ?? orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Failed to generate PDF")
    } finally {
      setPdfLoading(false)
    }
  }, [orderId, data?.display_id])

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const [artifactsRes, proofsRes] = await Promise.all([
        fetch(adminCustomizerDownloadPath(orderId), {
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
        fetch(adminProofPath(orderId), {
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
      ])
      const artifactsBody = (await artifactsRes.json().catch(() => ({}))) as DownloadPayload & { message?: string }
      if (!artifactsRes.ok) throw new Error(artifactsBody?.message || `HTTP ${artifactsRes.status}`)
      setPayload(artifactsBody)

      if (proofsRes.ok) {
        const proofsBody = await proofsRes.json().catch(() => ({})) as { proofs?: RevisedProof[] }
        setAllProofs(proofsBody.proofs ?? [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customizer assets")
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const lines = payload?.lines?.filter((line) => line.has_customizer) ?? []

  if (!orderId) return null

  const handleProofsChange = useCallback((updated: RevisedProof[]) => {
    setAllProofs(updated)
  }, [])

  const buildCustomiserSrc = (
    line: LinePayload,
    art: ArtifactPayload,
    artworkUrl: string | null
  ): string | null => {
    if (!storefrontUrl || !line.product_handle || !line.variant_id) return null
    const base = `${storefrontUrl}/${countryCode}/customizer`
    const params: Record<string, string> = {
      product: line.product_handle,
      variant: line.variant_id,
      adminProof: `${orderId}:${line.line_item_id}:${art.side}`,
    }
    if (artworkUrl) params.proofArtwork = encodeURIComponent(artworkUrl)
    return `${base}?${new URLSearchParams(params).toString()}`
  }

  return (
    <>
      {/* Fullscreen customiser modal */}
      {modalSrc ? (
        <CustomiserModal src={modalSrc} onClose={() => setModalSrc(null)} />
      ) : null}

      <Container className="divide-y p-0 border-t border-ui-border-base">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            type="button"
            className="flex items-center gap-2 text-left"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronDown
              className={`text-ui-fg-subtle transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
            />
            <div>
              <Heading level="h2" className="flex items-center">
                Customizer print & preview
                <HelpTooltip
                  text={{
                    title: "Customizer print & preview",
                    body: "Customer's original uploaded file, the rendered high-res print PNG, and the garment mockup JPEG for each decorated side. Upload a revised proof per location to replace the mockup in the customer's approval email.",
                    bullets: [
                      "Left column: artwork (customer upload or proof artwork).",
                      "Right column: garment mockup — swaps to show revised version from the history dropdown.",
                      "Upload a revised proof under any side to replace that mockup in the next approval email.",
                      "Use 'Customise position' to reposition artwork on the garment via the design tool.",
                    ],
                  }}
                />
              </Heading>
              <Text size="small" className="text-ui-fg-subtle mt-1">
                Customer uploads, print PNGs, mockups, and per-location proof history.
              </Text>
            </div>
          </button>
          <div className="flex flex-col items-end gap-y-1">
            <Button
              variant="secondary"
              size="small"
              onClick={downloadMockupPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating…" : "Download Mockup PDF"}
            </Button>
            {pdfError ? (
              <Text size="xsmall" className="text-ui-fg-error">
                {pdfError}
              </Text>
            ) : null}
          </div>
        </div>

        {!collapsed && (
          <div className="px-6 py-4">
            {error ? (
              <Text size="small" className="text-ui-fg-error">{error}</Text>
            ) : loading && !payload ? (
              <Text size="small" className="text-ui-fg-subtle">Loading downloadable assets…</Text>
            ) : lines.length === 0 ? (
              <Text size="small" className="text-ui-fg-subtle">
                No Fabric customizer (customizerDesign) metadata on this order line.
              </Text>
            ) : (
              <ul className="flex flex-col gap-y-5 list-none p-0 m-0">
                {lines.map((line) => (
                  <li
                    key={line.line_item_id}
                    className="border-b border-ui-border-base pb-4 last:border-0 last:pb-0"
                  >
                    <Text size="small" weight="plus" className="text-ui-fg-base">
                      {lineHeading(line)}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
                      Qty {line.quantity}
                    </Text>

                    {line.customer_original_files && line.customer_original_files.length > 0 ? (
                      <div className="mt-3 rounded-md border border-ui-border-base bg-ui-bg-component px-3 py-2">
                        <Text size="xsmall" weight="plus">
                          Customer upload (original file — unchanged)
                        </Text>
                        <ul className="mt-2 list-none m-0 p-0 flex flex-col gap-y-2">
                          {line.customer_original_files.map((f) => (
                            <li key={f.url}>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-xsmall text-ui-fg-muted">{f.mime_type}</span>
                                <span className="text-xsmall text-ui-fg-subtle truncate max-w-[200px]" title={f.file_name}>
                                  {f.file_name}
                                </span>
                              </div>
                              <a
                                href={f.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-small text-blue-600 hover:underline break-all mt-0.5 inline-block"
                              >
                                Download original ({f.file_name})
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {line.artifacts.length === 0 ? (
                      <Text size="xsmall" className="text-ui-fg-subtle mt-2">
                        Customizer metadata present but no per-side artifacts (or render did not persist
                        hosted URLs — check object storage).
                      </Text>
                    ) : null}

                    <ul className="mt-2 flex flex-col gap-y-3 list-none p-0">
                      {line.artifacts.map((art) => {
                        const key = sideKey(line.line_item_id, art.side)
                        const proofsForSide = allProofs.filter(
                          (p) => p.line_item_id === line.line_item_id && p.side === art.side
                        )
                        const customerOriginalFileUrl =
                          line.customer_original_files?.[0]?.url ?? null

                        // Build customiser URL — requires storefront URL + product handle + variant ID
                        const makeCustomiserCb = (artworkUrl: string | null) => {
                          const src = buildCustomiserSrc(line, art, artworkUrl)
                          if (src) setModalSrc(src)
                        }
                        const canCustomise =
                          !!storefrontUrl &&
                          !!line.product_handle &&
                          !!line.variant_id

                        return (
                          <SideProofCard
                            key={key}
                            orderId={orderId}
                            lineItemId={line.line_item_id}
                            art={art}
                            proofsForSide={proofsForSide}
                            customerOriginalFileUrl={customerOriginalFileUrl}
                            onProofsChange={handleProofsChange}
                            onCustomisePosition={canCustomise ? makeCustomiserCb : null}
                          />
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Container>
    </>
  )
}

export const config = defineWidgetConfig({
  /** Main column (full width) — above JSON debug; easy to scan without expanding metadata. */
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderCustomizerDownloadsWidget, "order-customizer-downloads")
