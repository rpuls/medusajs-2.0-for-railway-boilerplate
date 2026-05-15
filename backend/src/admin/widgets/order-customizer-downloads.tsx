import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

function adminCustomizerDownloadPath(orderId: string) {
  return `/admin/orders/${orderId}/customizer-download`
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
}

type DownloadPayload = {
  order_id?: string
  lines?: LinePayload[]
}

function lineHeading(line: LinePayload) {
  const product = line.product_title || line.title || "Product"
  const variant =
    line.variant_title && typeof line.variant_title === "string" ? line.variant_title : null
  return variant ? `${product} · ${variant}` : product
}

const OrderCustomizerDownloadsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [payload, setPayload] = useState<DownloadPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

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
    if (!orderId) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(adminCustomizerDownloadPath(orderId), {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      const body = (await res.json().catch(() => ({}))) as DownloadPayload & { message?: string }
      if (!res.ok) {
        throw new Error(body?.message || `HTTP ${res.status}`)
      }
      setPayload(body)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customizer URLs")
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const lines = payload?.lines?.filter((line) => line.has_customizer) ?? []

  if (!orderId) {
    return null
  }

  return (
    <Container className="divide-y p-0 border-t border-ui-border-base">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Customizer print & preview</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Customer uploads (exact file), rendered print PNG, and garment mockup from order metadata.
          </Text>
        </div>
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

      <div className="px-6 py-4">
        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : loading && !payload ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading downloadable assets…
          </Text>
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
                    hosted URLs—check object storage).
                  </Text>
                ) : null}

                <ul className="mt-2 flex flex-col gap-y-3 list-none p-0">
                  {line.artifacts.map((art) => (
                    <li
                      key={`${line.line_item_id}-${art.side}`}
                      className="rounded-md bg-ui-bg-subtle px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Text size="xsmall" weight="plus">
                          {art.side_label}
                        </Text>
                        {art.print_url_inline_omitted ? (
                          <Badge size="2xsmall" color="orange">
                            Print file too large (inline)
                          </Badge>
                        ) : null}
                        {art.mockup_url_inline_omitted ? (
                          <Badge size="2xsmall" color="orange">
                            Mockup too large (inline)
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {art.print_url ? (
                          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden">
                            <img
                              src={art.print_url}
                              alt={`Print artwork ${art.side_label}`}
                              className="mx-auto block max-h-48 w-auto object-contain bg-ui-bg-component p-2"
                            />
                            <div className="border-t border-ui-border-base px-3 py-2">
                              <Text size="xsmall" className="text-ui-fg-subtle mb-1">
                                Generated print file (not the customer upload)
                              </Text>
                              <a
                                href={art.print_url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-small text-blue-600 hover:underline break-all"
                              >
                                Open generated print PNG (right-click → Save as…)
                              </a>
                            </div>
                          </div>
                        ) : !art.print_url_inline_omitted ? (
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            No print URL on record for this side.
                          </Text>
                        ) : null}
                        {art.mockup_url ? (
                          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden">
                            <img
                              src={art.mockup_url}
                              alt={`Garment preview ${art.side_label}`}
                              className="mx-auto block max-h-48 w-auto object-contain bg-ui-bg-component p-2"
                            />
                            <div className="border-t border-ui-border-base px-3 py-2">
                              <Text size="xsmall" className="text-ui-fg-subtle mb-1">
                                Garment mockup (JPEG)
                              </Text>
                              <a
                                href={art.mockup_url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-small text-blue-600 hover:underline break-all"
                              >
                                Open mockup JPEG (right-click → Save as…)
                              </a>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  /** Main column (full width) — above JSON debug; easy to scan without expanding metadata. */
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderCustomizerDownloadsWidget, "order-customizer-downloads")
