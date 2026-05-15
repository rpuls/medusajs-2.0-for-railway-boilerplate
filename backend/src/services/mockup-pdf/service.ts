import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"

const ASSETS_DIR = path.join(__dirname, "../../assets")
const FONTS_DIR = path.join(ASSETS_DIR, "fonts")
const IMAGES_DIR = path.join(ASSETS_DIR, "images")

const PRINT_SIZE_LABELS: Record<string, string> = {
  up_to_a6: "10×15 cm",
  up_to_a4: "21×30 cm",
  up_to_a3: "29×42 cm",
  oversize: "38×48 cm",
}

const DISCLAIMER =
  "By confirming this artwork approval, you acknowledge that you, the customer, have reviewed " +
  "sizes/positions and approved the order for production. You understand that there may be " +
  "slight variations in the final product and that the mockup shown is only a representation " +
  "of the final product."

const SIZE_ORDER = [
  "2XS", "XS", "S", "M", "L", "XL",
  "2XL", "XXL", "3XL", "XXXL", "4XL", "XXXXL", "5XL", "XXXXXL", "6XL", "7XL", "8XL",
]

type SizeQuantity = { size: string; quantity: number }

type ArtifactEntry = {
  side: string
  mockupUrl?: string | null
  printUrl?: string | null
}

type OrderItem = {
  id: string
  product_id?: string | null
  product_title?: string | null
  title?: string | null
  variant_title?: string | null
  quantity?: number
  metadata?: Record<string, unknown> | null
}

type ShippingAddress = {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
}

export type MockupOrder = {
  id: string
  display_id?: number | string | null
  created_at?: Date | string | null
  metadata?: Record<string, unknown> | null
  shipping_address?: ShippingAddress | null
  items?: OrderItem[]
}

export type MockupPdfOptions = {
  jobNumberOverride?: string
}

interface PageData {
  productTitle: string
  printSizeLabel: string
  frontMockupBuf: Buffer | null
  backMockupBuf: Buffer | null
  sizes: SizeQuantity[]
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear()).slice(-2)
  return `${day}.${month}.${year}`
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  if (!url || !url.startsWith("http")) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

function extractSize(variantTitle: string | null | undefined): string {
  if (!variantTitle) return "Unknown"
  const parts = variantTitle.split("/").map((p) => p.trim())
  return parts[parts.length - 1] || variantTitle.trim()
}

function sortSizes(sizes: SizeQuantity[]): SizeQuantity[] {
  return [...sizes].sort((a, b) => {
    const sA = a.size.toUpperCase().trim()
    const sB = b.size.toUpperCase().trim()
    const ai = SIZE_ORDER.indexOf(sA)
    const bi = SIZE_ORDER.indexOf(sB)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return sA.localeCompare(sB)
  })
}

function buildPageData(
  groupItems: OrderItem[],
  frontBuf: Buffer | null,
  backBuf: Buffer | null
): PageData {
  const canonical =
    groupItems.find(
      (it) => it.metadata?.customizerDesign && typeof it.metadata.customizerDesign === "object"
    ) ?? groupItems[0]

  const rawDesign =
    canonical?.metadata?.customizerDesign &&
    typeof canonical.metadata.customizerDesign === "object"
      ? (canonical.metadata.customizerDesign as Record<string, unknown>)
      : null

  // Sizes: aggregate from actual line-item quantities (most accurate), fallback to metadata
  const sizeMap = new Map<string, number>()
  for (const it of groupItems) {
    const size = extractSize(it.variant_title)
    sizeMap.set(size, (sizeMap.get(size) ?? 0) + (Number(it.quantity) || 1))
  }
  let sizes: SizeQuantity[] = Array.from(sizeMap.entries()).map(([size, quantity]) => ({
    size,
    quantity,
  }))

  // If aggregation produced only "Unknown" (no variant data), try metadata.sizes
  if (
    sizes.length === 0 ||
    (sizes.length === 1 && sizes[0].size === "Unknown")
  ) {
    const metaSizes = Array.isArray(rawDesign?.sizes) ? (rawDesign!.sizes as SizeQuantity[]) : []
    if (metaSizes.length > 0) sizes = metaSizes
  }

  const printSizeId =
    typeof rawDesign?.scpPrintSizeId === "string" ? rawDesign.scpPrintSizeId : null
  const printSizeLabel = printSizeId ? (PRINT_SIZE_LABELS[printSizeId] ?? "") : ""
  const productTitle = String(
    canonical?.product_title ?? canonical?.title ?? "Product"
  )

  return {
    productTitle,
    printSizeLabel,
    frontMockupBuf: frontBuf,
    backMockupBuf: backBuf,
    sizes: sortSizes(sizes),
  }
}

export async function generateMockupPdf(
  order: MockupOrder,
  options: MockupPdfOptions = {}
): Promise<Buffer> {
  const { jobNumberOverride } = options

  // Job number: override → metadata.job_number → display_id → id
  const jobNumber =
    jobNumberOverride ??
    (typeof order.metadata?.job_number === "string"
      ? order.metadata.job_number
      : null) ??
    String(order.display_id ?? order.id)

  // Customer name: company → full name from shipping address
  const addr = order.shipping_address
  const company = addr?.company ? String(addr.company).trim() : ""
  const contact = [addr?.first_name, addr?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const customerName = company || contact || "Customer"

  const orderDate = order.created_at ? formatDate(order.created_at) : formatDate(new Date())

  // Group items by product_id
  const items: OrderItem[] = order.items ?? []
  const grouped = new Map<string, OrderItem[]>()
  for (const item of items) {
    const key = String(item.product_id ?? item.id)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(item)
  }

  // Build page data (fetch mockup images concurrently per group)
  const pages: PageData[] = await Promise.all(
    Array.from(grouped.values()).map(async (groupItems) => {
      const canonical =
        groupItems.find(
          (it) =>
            it.metadata?.customizerDesign &&
            typeof it.metadata.customizerDesign === "object"
        ) ?? groupItems[0]

      const rawDesign =
        canonical?.metadata?.customizerDesign &&
        typeof canonical.metadata.customizerDesign === "object"
          ? (canonical.metadata.customizerDesign as Record<string, unknown>)
          : null

      const artifacts = Array.isArray(rawDesign?.artifacts)
        ? (rawDesign!.artifacts as ArtifactEntry[])
        : []

      const frontUrl =
        artifacts.find((a) => a.side === "front")?.mockupUrl ?? null
      const backUrl =
        artifacts.find((a) => a.side === "back")?.mockupUrl ?? null

      const [frontBuf, backBuf] = await Promise.all([
        frontUrl ? fetchImageBuffer(frontUrl) : Promise.resolve(null),
        backUrl ? fetchImageBuffer(backUrl) : Promise.resolve(null),
      ])

      return buildPageData(groupItems, frontBuf, backBuf)
    })
  )

  // Load static assets once
  const regularFontBuf = fs.readFileSync(
    path.join(FONTS_DIR, "PlusJakartaSans-Regular.woff")
  )
  const boldFontBuf = fs.readFileSync(
    path.join(FONTS_DIR, "PlusJakartaSans-Bold.woff")
  )
  const logoImageBuf = fs.readFileSync(
    path.join(IMAGES_DIR, "sc-prints-logo.png")
  )

  return buildPdf({ jobNumber, customerName, orderDate, pages, regularFontBuf, boldFontBuf, logoImageBuf })
}

function buildPdf(params: {
  jobNumber: string
  customerName: string
  orderDate: string
  pages: PageData[]
  regularFontBuf: Buffer
  boldFontBuf: Buffer
  logoImageBuf: Buffer
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { jobNumber, customerName, orderDate, pages, regularFontBuf, boldFontBuf, logoImageBuf } =
      params

    const doc = new PDFDocument({ size: "A4", autoFirstPage: false })

    doc.registerFont("PJS", regularFontBuf)
    doc.registerFont("PJS-Bold", boldFontBuf)

    const chunks: Buffer[] = []
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    // A4: 595.28 × 841.89 pt
    const PW = 595.28
    const ML = 30
    const MR = 30
    const MT = 25
    const usableW = PW - ML - MR // ~535pt

    for (const page of pages) {
      const { productTitle, printSizeLabel, frontMockupBuf, backMockupBuf, sizes } = page

      doc.addPage()

      // ── HEADER ──────────────────────────────────────────────────────────────
      const headerRows = [
        { label: "Job:", value: jobNumber },
        { label: "Date:", value: orderDate },
        { label: "CUSTOMER:", value: customerName },
      ]
      let textY = MT
      for (const { label, value } of headerRows) {
        doc
          .font("PJS-Bold")
          .fontSize(12.5)
          .fillColor("#000000")
          .text(label, ML, textY, { continued: true, lineBreak: false })
        doc
          .font("PJS")
          .fontSize(12.5)
          .text("  " + value, { lineBreak: false })
        textY += 20
      }

      // SC Prints logo — top right
      const logoW = 100
      const logoH = 100
      doc.image(logoImageBuf, PW - MR - logoW, MT, {
        width: logoW,
        height: logoH,
        fit: [logoW, logoH],
      })

      // ── MOCKUP IMAGES ────────────────────────────────────────────────────────
      const imgY = MT + 118
      const imgH = 285
      const imgW = 245

      if (frontMockupBuf && backMockupBuf) {
        const gap = usableW - imgW * 2
        doc.image(frontMockupBuf, ML, imgY, { width: imgW, height: imgH, fit: [imgW, imgH] })
        doc.image(backMockupBuf, ML + imgW + gap, imgY, {
          width: imgW,
          height: imgH,
          fit: [imgW, imgH],
        })
      } else if (frontMockupBuf ?? backMockupBuf) {
        const singleBuf = (frontMockupBuf ?? backMockupBuf)!
        const centreX = ML + (usableW - imgW) / 2
        doc.image(singleBuf, centreX, imgY, { width: imgW, height: imgH, fit: [imgW, imgH] })
      }

      // ── POSITIONING & SIZING SECTION ─────────────────────────────────────────
      const ruleY = imgY + imgH + 14
      doc
        .moveTo(ML, ruleY)
        .lineTo(PW - MR, ruleY)
        .lineWidth(0.5)
        .stroke("#cccccc")

      const posHeadY = ruleY + 8
      doc
        .font("PJS-Bold")
        .fontSize(10)
        .fillColor("#000000")
        .text("Positioning and sizing", ML, posHeadY, { width: usableW, align: "center" })

      const dimY = posHeadY + 17
      const dimText = printSizeLabel ? `Dimensions:  ${printSizeLabel}` : "Dimensions:"
      const halfW = (usableW - 10) / 2
      doc
        .font("PJS")
        .fontSize(9)
        .fillColor("#444444")
        .text(dimText, ML, dimY, { width: halfW })
        .text(dimText, ML + halfW + 10, dimY, { width: halfW })

      // ── DISCLAIMER BOX ────────────────────────────────────────────────────────
      const boxPad = 10
      const disclaimerY = dimY + 22
      const disclaimerTextW = usableW - boxPad * 2

      doc.font("PJS").fontSize(8)
      const disclaimerH =
        doc.heightOfString(DISCLAIMER, { width: disclaimerTextW }) + boxPad * 2

      doc.roundedRect(ML, disclaimerY, usableW, disclaimerH, 4).fill("#f0f0f0")
      doc
        .font("PJS")
        .fontSize(8)
        .fillColor("#333333")
        .text(DISCLAIMER, ML + boxPad, disclaimerY + boxPad, { width: disclaimerTextW })

      // ── ORDER QUANTITIES BOX ──────────────────────────────────────────────────
      const qtyY = disclaimerY + disclaimerH + 10
      const qtyLineH = 14
      const qtyTitleH = 18
      const qtyProductH = 16
      const qtyBoxH = qtyTitleH + qtyProductH + sizes.length * qtyLineH + boxPad * 2

      doc.roundedRect(ML, qtyY, usableW, qtyBoxH, 4).fill("#f0f0f0")

      let qy = qtyY + boxPad
      doc
        .font("PJS-Bold")
        .fontSize(11)
        .fillColor("#000000")
        .text("Order Quantities & Sizing", ML + boxPad, qy)
      qy += qtyTitleH

      doc
        .font("PJS-Bold")
        .fontSize(10)
        .text(productTitle, ML + boxPad, qy)
      qy += qtyProductH

      for (const { size, quantity } of sizes) {
        doc
          .font("PJS")
          .fontSize(10)
          .fillColor("#333333")
          .text(`${size.padEnd(8)}  -  ${quantity}`, ML + boxPad, qy)
        qy += qtyLineH
      }

      doc.fillColor("#000000")
    }

    doc.end()
  })
}
