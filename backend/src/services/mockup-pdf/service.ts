import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import sharp from "sharp"

// Brand magenta: #ff2e63
const BRAND_MAGENTA = { r: 255, g: 46, b: 99 }

/**
 * Remove the near-white background from a mockup image.
 *
 * Strategy: global threshold — every pixel where R, G, and B are all ≥ threshold
 * becomes fully transparent. This reliably handles sleeve / tag mockups that are
 * cropped tight to the garment (where edge-connected flood-fill can't reach the
 * background). Safe for any coloured garment because coloured fabric always has
 * at least one channel well below 220 (e.g. orange: B = 0, blue: R ≈ 0).
 * White garments on white backgrounds are an inherent limitation of any
 * colour-based approach.
 */
async function removeWhiteBackground(imgBuf: Buffer, threshold = 220): Promise<Buffer> {
  const { data, info } = await sharp(imgBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = info.width * info.height
  const out = Buffer.from(data)

  for (let i = 0; i < pixels; i++) {
    if (
      data[i * 4 + 0] >= threshold &&
      data[i * 4 + 1] >= threshold &&
      data[i * 4 + 2] >= threshold
    ) {
      out[i * 4 + 3] = 0
    }
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
}

async function makeMagentaLogo(
  logoBuf: Buffer,
  size: number,
  opacity: number
): Promise<Buffer> {
  // Resize to square target
  const resized = await sharp(logoBuf)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data, info } = resized
  const pixels = info.width * info.height
  const out = Buffer.alloc(pixels * 4)

  for (let i = 0; i < pixels; i++) {
    const a = data[i * 4 + 3]
    out[i * 4 + 0] = BRAND_MAGENTA.r
    out[i * 4 + 1] = BRAND_MAGENTA.g
    out[i * 4 + 2] = BRAND_MAGENTA.b
    out[i * 4 + 3] = Math.round(a * opacity)
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
}

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

const SIDE_ORDER = [
  "front", "back",
  "left_sleeve", "right_sleeve", "sleeve",
  "left", "right",
  "printed_tag", "tag",
]

const SIDE_LABELS: Record<string, string> = {
  front: "Front",
  back: "Back",
  left_sleeve: "Left Sleeve",
  right_sleeve: "Right Sleeve",
  sleeve: "Sleeve",
  left: "Left",
  right: "Right",
  printed_tag: "Tag",
  tag: "Tag",
}

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
  /** All decorated sides in display order; each carries its own print-size label */
  mockups: Array<{ side: string; buf: Buffer; printSizeLabel: string }>
  sizes: SizeQuantity[]
  printNotes: string | null
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

// Largest print size wins when multiple prints exist for one side
const PRINT_SIZE_PRIORITY = ["up_to_a6", "up_to_a4", "up_to_a3", "oversize"]

function buildPageData(
  groupItems: OrderItem[],
  mockups: Array<{ side: string; buf: Buffer }>
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

  const productTitle = String(
    canonical?.product_title ?? canonical?.title ?? "Product"
  )

  const rawNotes = rawDesign?.printNotes
  const printNotes =
    typeof rawNotes === "string" && rawNotes.trim() ? rawNotes.trim() : null

  // Per-side print dimensions — from customizerDesign.prints[] (per-print pricing model)
  // with fallback to the legacy single scpPrintSizeId field.
  type PrintSpecRaw = { side: string; sizeId: string }
  const prints = Array.isArray(rawDesign?.prints)
    ? (rawDesign!.prints as PrintSpecRaw[]).filter(
        (p) => typeof p.side === "string" && typeof p.sizeId === "string"
      )
    : []
  const globalSizeId =
    typeof rawDesign?.scpPrintSizeId === "string" ? rawDesign.scpPrintSizeId : null

  function sideLabel(side: string): string {
    const sidePrints = prints.filter((p) => p.side === side)
    if (sidePrints.length > 0) {
      const best = sidePrints.reduce((a, b) =>
        PRINT_SIZE_PRIORITY.indexOf(b.sizeId) > PRINT_SIZE_PRIORITY.indexOf(a.sizeId) ? b : a
      )
      return PRINT_SIZE_LABELS[best.sizeId] ?? ""
    }
    return globalSizeId ? (PRINT_SIZE_LABELS[globalSizeId] ?? "") : ""
  }

  return {
    productTitle,
    mockups: mockups.map((m) => ({ ...m, printSizeLabel: sideLabel(m.side) })),
    sizes: sortSizes(sizes),
    printNotes,
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

      // Collect every side that has a mockup URL, in display order
      const sidesWithUrls = artifacts
        .filter((a): a is ArtifactEntry & { mockupUrl: string } =>
          typeof a.mockupUrl === "string" && a.mockupUrl.startsWith("http")
        )
        .sort((a, b) => {
          const ai = SIDE_ORDER.indexOf(a.side)
          const bi = SIDE_ORDER.indexOf(b.side)
          if (ai !== -1 && bi !== -1) return ai - bi
          if (ai !== -1) return -1
          if (bi !== -1) return 1
          return 0
        })

      const rawBufs = await Promise.all(
        sidesWithUrls.map((a) => fetchImageBuffer(a.mockupUrl))
      )

      // Strip white background so the watermark shows through behind the garment
      const processedBufs = await Promise.all(
        rawBufs.map((buf) => (buf ? removeWhiteBackground(buf) : Promise.resolve(null)))
      )

      const mockups = sidesWithUrls
        .map((a, i) => ({ side: a.side, buf: processedBufs[i] }))
        .filter((m): m is { side: string; buf: Buffer } => m.buf !== null)

      return buildPageData(groupItems, mockups)
    })
  )

  // Load static assets once
  const regularFontBuf = fs.readFileSync(
    path.join(FONTS_DIR, "PlusJakartaSans-Regular.woff")
  )
  const boldFontBuf = fs.readFileSync(
    path.join(FONTS_DIR, "PlusJakartaSans-Bold.woff")
  )
  const rawLogoBuf = fs.readFileSync(
    path.join(IMAGES_DIR, "sc-prints-logo.png")
  )

  const [magentaLogoFull, magentaLogoWatermark] = await Promise.all([
    makeMagentaLogo(rawLogoBuf, 100, 1.0),
    makeMagentaLogo(rawLogoBuf, 750, 0.10),
  ])

  return buildPdf({ jobNumber, customerName, orderDate, pages, regularFontBuf, boldFontBuf, magentaLogoFull, magentaLogoWatermark })
}

function buildPdf(params: {
  jobNumber: string
  customerName: string
  orderDate: string
  pages: PageData[]
  regularFontBuf: Buffer
  boldFontBuf: Buffer
  magentaLogoFull: Buffer
  magentaLogoWatermark: Buffer
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { jobNumber, customerName, orderDate, pages, regularFontBuf, boldFontBuf, magentaLogoFull, magentaLogoWatermark } =
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
      const { productTitle, mockups, sizes, printNotes } = page

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
        textY += 17
      }

      // SC Prints logo — top right, magenta
      const logoW = 72
      const logoH = 72
      doc.image(magentaLogoFull, PW - MR - logoW, MT, {
        width: logoW,
        height: logoH,
        fit: [logoW, logoH],
      })

      // ── MOCKUP IMAGES ────────────────────────────────────────────────────────
      const PH = 841.89
      const imgY = MT + 80
      // Total image band height (includes cell images + per-row labels)
      const imgBandH = 440
      const labelH = 13  // height reserved for the side-label row

      // Watermark: centred on the full A4 page (750pt bleeds past all edges)
      const wmSize = 750
      const wmX = (PW - wmSize) / 2
      const wmY = (PH - wmSize) / 2
      doc.image(magentaLogoWatermark, wmX, wmY, { width: wmSize, height: wmSize })

      if (mockups.length > 0) {
        const count = mockups.length
        // ≤4 sides → 2 cols; 5+ sides → 3 cols
        const cols = count >= 5 ? 3 : count === 1 ? 1 : 2
        const rows = Math.ceil(count / cols)
        const colGap = 8
        const rowGap = 10
        // Per-cell image height: divide available band after reserving label rows and gaps
        const cellH = (imgBandH - labelH * rows - rowGap * (rows - 1)) / rows
        const cellW = (usableW - colGap * (cols - 1)) / cols

        for (let i = 0; i < count; i++) {
          const { side, buf } = mockups[i]
          const row = Math.floor(i / cols)
          const col = i % cols

          // Centre an incomplete last row
          const itemsInLastRow = count % cols || cols
          const itemsInRow = row === rows - 1 ? itemsInLastRow : cols
          const rowXOff =
            itemsInRow < cols
              ? (usableW - (itemsInRow * cellW + (itemsInRow - 1) * colGap)) / 2
              : 0

          const x = ML + rowXOff + col * (cellW + colGap)
          const y = imgY + row * (cellH + rowGap + labelH)

          doc.image(buf, x, y, {
            width: cellW,
            height: cellH,
            fit: [cellW, cellH],
            align: "center",
            valign: "center",
          })

          // Side label beneath image
          const label =
            SIDE_LABELS[side] ??
            side.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          doc
            .font("PJS")
            .fontSize(8)
            .fillColor("#666666")
            .text(label, x, y + cellH + 2, { width: cellW, align: "center" })
        }
      }

      // ── POSITIONING & SIZING SECTION ─────────────────────────────────────────
      const ruleY = imgY + imgBandH + 8
      doc
        .moveTo(ML, ruleY)
        .lineTo(PW - MR, ruleY)
        .lineWidth(0.5)
        .stroke("#cccccc")

      const posHeadY = ruleY + 6
      doc
        .font("PJS-Bold")
        .fontSize(10)
        .fillColor("#000000")
        .text("Positioning and sizing", ML, posHeadY, { width: usableW, align: "center" })

      const dimY = posHeadY + 14
      // Group sides that share the same print size: "Front & Back: 21×30 cm  ·  Left Sleeve: 10×15 cm …"
      const dimGroups: Array<{ sides: string[]; sizeLabel: string }> = []
      for (const m of mockups) {
        if (!m.printSizeLabel) continue
        const existing = dimGroups.find((g) => g.sizeLabel === m.printSizeLabel)
        const name = SIDE_LABELS[m.side] ?? m.side.replace(/_/g, " ")
        if (existing) {
          existing.sides.push(name)
        } else {
          dimGroups.push({ sides: [name], sizeLabel: m.printSizeLabel })
        }
      }
      const dimText = dimGroups.length
        ? dimGroups.map((g) => `${g.sides.join(" & ")}: ${g.sizeLabel}`).join("   ·   ")
        : "Dimensions: —"
      doc
        .font("PJS")
        .fontSize(9)
        .fillColor("#444444")
        .text(dimText, ML, dimY, { width: usableW, align: "center" })

      // ── DISCLAIMER BOX ────────────────────────────────────────────────────────
      const boxPad = 10
      const disclaimerY = dimY + 16
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

      // ── CUSTOMER NOTES BOX (only if notes are present) ───────────────────────
      let notesBoxH = 0
      const notesY = disclaimerY + disclaimerH + 10
      if (printNotes) {
        const notesTextW = usableW - boxPad * 2
        doc.font("PJS").fontSize(8)
        notesBoxH =
          doc.heightOfString(printNotes, { width: notesTextW - 55 }) + boxPad * 2

        doc.roundedRect(ML, notesY, usableW, notesBoxH, 4).fill("#fff7ed")
        doc
          .font("PJS-Bold")
          .fontSize(8)
          .fillColor("#92400e")
          .text("Customer Notes:  ", ML + boxPad, notesY + boxPad, {
            continued: true,
            lineBreak: false,
          })
        doc
          .font("PJS")
          .fontSize(8)
          .fillColor("#78350f")
          .text(printNotes, { width: notesTextW - 55 })
      }

      // ── ORDER QUANTITIES BOX ──────────────────────────────────────────────────
      const qtyY = notesY + (printNotes ? notesBoxH + 10 : 0)
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
        .text("Order Sizes and Quantities", ML + boxPad, qy)
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
