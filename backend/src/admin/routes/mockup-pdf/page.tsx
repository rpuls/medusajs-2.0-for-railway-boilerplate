import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Text } from "@medusajs/ui"
import { useCallback, useState } from "react"

function adminFetchPath(path: string) {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

const MockupPdfPage = () => {
  const [orderId, setOrderId] = useState("")
  const [jobNumber, setJobNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFilename, setLastFilename] = useState<string | null>(null)

  const generate = useCallback(async () => {
    const id = orderId.trim()
    if (!id) {
      setError("Please enter an order ID.")
      return
    }
    setLoading(true)
    setError(null)
    setLastFilename(null)

    try {
      const params = new URLSearchParams()
      if (jobNumber.trim()) params.set("job_number", jobNumber.trim())
      const qs = params.toString() ? `?${params.toString()}` : ""
      const url = adminFetchPath(`/admin/orders/${encodeURIComponent(id)}/mockup-pdf${qs}`)

      const res = await fetch(url, { credentials: "include" })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        throw new Error(body?.message ?? `HTTP ${res.status}`)
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      // Derive filename from Content-Disposition or construct a fallback
      const cd = res.headers.get("Content-Disposition") ?? ""
      const match = cd.match(/filename="?([^";]+)"?/)
      const filename = match?.[1] ?? `artwork-approval-${id}.pdf`

      const a = document.createElement("a")
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000)

      setLastFilename(filename)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate PDF")
    } finally {
      setLoading(false)
    }
  }, [orderId, jobNumber])

  return (
    <div className="flex flex-col gap-y-4 p-6">
      <div>
        <Heading level="h1">Generate Artwork Approval PDF</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Creates a printable artwork approval document from an order's customizer mockup images.
          One page per garment type with front &amp; back views, print dimensions, and size quantities.
        </Text>
      </div>

      <Container className="p-6 flex flex-col gap-y-5 max-w-lg">
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="order-id" size="small" weight="plus">
            Order ID
          </Label>
          <Input
            id="order-id"
            type="text"
            placeholder="order_01JXXXXXXXXXXXXXXXX"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void generate() }}
          />
          <Text size="xsmall" className="text-ui-fg-muted">
            The internal Medusa order ID (starts with <code>order_</code>).
          </Text>
        </div>

        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="job-number" size="small" weight="plus">
            Job Number Override{" "}
            <span className="font-normal text-ui-fg-subtle">(optional)</span>
          </Label>
          <Input
            id="job-number"
            type="text"
            placeholder="Leave blank to use order display ID"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void generate() }}
          />
          <Text size="xsmall" className="text-ui-fg-muted">
            Overrides the "Job:" field in the PDF header for this generation only.
          </Text>
        </div>

        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : null}

        {lastFilename && !error ? (
          <Text size="small" className="text-ui-fg-subtle">
            Downloaded: {lastFilename}
          </Text>
        ) : null}

        <Button
          variant="primary"
          onClick={() => void generate()}
          disabled={loading || !orderId.trim()}
          className="w-fit"
        >
          {loading ? "Generating…" : "Generate & Download PDF"}
        </Button>
      </Container>

      <Container className="p-6 max-w-lg">
        <Heading level="h2" className="mb-3">
          Tips
        </Heading>
        <ul className="flex flex-col gap-y-2 text-sm text-ui-fg-subtle list-disc list-inside">
          <li>
            You can also generate directly from the order detail page — look for the{" "}
            <strong>Download Mockup PDF</strong> button in the "Customizer print & preview" section.
          </li>
          <li>
            The PDF uses the order's display ID as the Job number by default. Use the override
            field above if you have a separate job numbering system.
          </li>
          <li>
            To set a persistent job number on an order, add{" "}
            <code>job_number</code> to the order's metadata — the PDF will use it automatically.
          </li>
          <li>
            Mockup images must have been rendered at add-to-cart time. Orders that don't go through
            the Fabric.js customizer won't have images in the PDF.
          </li>
        </ul>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Mockup PDF",
})

export default MockupPdfPage
