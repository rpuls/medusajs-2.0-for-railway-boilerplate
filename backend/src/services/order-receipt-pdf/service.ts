import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import sharp from "sharp"

const ASSETS_DIR = path.join(__dirname, "../../assets")
const FONTS_DIR = path.join(ASSETS_DIR, "fonts")
const IMAGES_DIR = path.join(ASSETS_DIR, "images")

const BRAND_PRIMARY = "#0f172a"
const BRAND_SECONDARY = "#ff2e63"
const TEXT_MUTED = "#666666"
const RULE_COLOR = "#e5e7eb"

type Address = {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

type ShippingMethod = {
  name?: string | null
  amount?: number | string | null
}

type LineItemPricing = {
  baseUnitPriceCents?: number | null
  sideSurchargePerUnitCents?: number | null
}

type CustomizerDesign = {
  pricing?: LineItemPricing | null
}

type OrderItem = {
  id: string
  title?: string | null
  product_title?: string | null
  variant_title?: string | null
  variant_sku?: string | null
  quantity?: number | null
  unit_price?: number | string | null
  total?: number | string | null
  metadata?: Record<string, unknown> | null
}

export type ReceiptOrder = {
  id: string
  display_id?: number | string | null
  created_at?: Date | string | null
  email?: string | null
  currency_code?: string | null
  subtotal?: number | string | null
  shipping_total?: number | string | null
  tax_total?: number | string | null
  total?: number | string | null
  metadata?: Record<string, unknown> | null
  shipping_address?: Address | null
  billing_address?: Address | null
  items?: OrderItem[] | null
  shipping_methods?: ShippingMethod[] | null
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function formatMoney(
  value: number | string | null | undefined,
  currency: string
): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: (currency || "AUD").toUpperCase(),
  }).format(toNumber(value))
}

function formatDate(d: Date | string | null | undefined): string {
  const date = d ? (typeof d === "string" ? new Date(d) : d) : new Date()
  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getCustomizerPricing(item: OrderItem): LineItemPricing | null {
  const raw = item.metadata?.customizerDesign as CustomizerDesign | undefined
  return raw?.pricing ?? null
}

async function tintLogo(logoBuf: Buffer, size: number, hex: string): Promise<Buffer> {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const { data, info } = await sharp(logoBuf)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = info.width * info.height
  for (let i = 0; i < pixels; i++) {
    if (data[i * 4 + 3] > 0) {
      data[i * 4] = r
      data[i * 4 + 1] = g
      data[i * 4 + 2] = b
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

export async function generateReceiptPdf(
  order: ReceiptOrder
): Promise<Buffer> {
  const regularFontBuf = fs.readFileSync(
    path.join(FONTS_DIR, "PlusJakartaSans-Regular.woff")
  )
  const boldFontBuf = fs.readFileSync(
    path.join(FONTS_DIR, "PlusJakartaSans-Bold.woff")
  )
  const rawLogoBuf = fs.readFileSync(
    path.join(IMAGES_DIR, "sc-prints-logo.png")
  )
  const logoTinted = await tintLogo(rawLogoBuf, 200, BRAND_SECONDARY)

  return buildPdf({ order, regularFontBuf, boldFontBuf, logoBuf: logoTinted })
}

function buildPdf(params: {
  order: ReceiptOrder
  regularFontBuf: Buffer
  boldFontBuf: Buffer
  logoBuf: Buffer
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { order, regularFontBuf, boldFontBuf, logoBuf } = params

    const doc = new PDFDocument({ size: "A4", margin: 0 })
    doc.registerFont("PJS", regularFontBuf)
    doc.registerFont("PJS-Bold", boldFontBuf)

    const chunks: Buffer[] = []
    doc.on("data", (c: Buffer) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const PW = 595.28
    const PH = 841.89
    const ML = 48
    const MR = 48
    const usableW = PW - ML - MR

    const currency = String(order.currency_code ?? "AUD").toUpperCase()
    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const taxExempt = meta.tax_exempt === true
    const taxExemptReason =
      typeof meta.tax_exempt_reason === "string" ? meta.tax_exempt_reason : null
    const taxExemptAbn =
      typeof meta.tax_exempt_abn === "string" ? meta.tax_exempt_abn : null

    const shipping = (order.shipping_address ?? {}) as Address
    const billing = (order.billing_address ?? shipping) as Address

    const items = (order.items ?? []) as OrderItem[]
    const displayId = String(order.display_id ?? order.id)
    const dateStr = formatDate(order.created_at)

    // ── HEADER ─────────────────────────────────────────────────────────────
    const logoW = 56
    const logoH = 56
    doc.image(logoBuf, ML, 48, { width: logoW, height: logoH, fit: [logoW, logoH] })

    doc
      .font("PJS-Bold")
      .fontSize(20)
      .fillColor(BRAND_PRIMARY)
      .text("Tax Invoice", ML + logoW + 14, 56)

    doc
      .font("PJS")
      .fontSize(10)
      .fillColor(TEXT_MUTED)
      .text(`Order #${displayId}  ·  ${dateStr}`, ML + logoW + 14, 82)

    // Brand block right
    doc
      .font("PJS-Bold")
      .fontSize(12)
      .fillColor(BRAND_PRIMARY)
      .text("SC PRINTS", ML, 56, { width: usableW, align: "right" })
    doc
      .font("PJS")
      .fontSize(9)
      .fillColor(TEXT_MUTED)
      .text("info@scprints.com.au", ML, 72, { width: usableW, align: "right" })
    doc
      .font("PJS")
      .fontSize(9)
      .fillColor(TEXT_MUTED)
      .text("scprints.com.au", ML, 86, { width: usableW, align: "right" })

    if (taxExempt) {
      doc
        .roundedRect(PW - MR - 150, 104, 150, 18, 9)
        .fill("#fef3c7")
      doc
        .font("PJS-Bold")
        .fontSize(9)
        .fillColor("#92400e")
        .text("No-GST · Tax exempt", PW - MR - 150, 109, {
          width: 150,
          align: "center",
        })
    }

    // ── ADDRESSES ──────────────────────────────────────────────────────────
    const addrY = 140
    const colW = (usableW - 24) / 2

    const renderAddressColumn = (
      label: string,
      x: number,
      addr: Address,
      extras: Array<string | null> = []
    ) => {
      doc
        .font("PJS-Bold")
        .fontSize(9)
        .fillColor(TEXT_MUTED)
        .text(label.toUpperCase(), x, addrY, { width: colW, characterSpacing: 0.6 })

      let y = addrY + 14
      const lines = [
        [addr.first_name, addr.last_name].filter(Boolean).join(" ").trim() ||
          (order.email ?? ""),
        addr.company ?? "",
        addr.address_1 ?? "",
        addr.address_2 ?? "",
        [addr.city, addr.province, addr.postal_code]
          .filter(Boolean)
          .join(" ")
          .trim(),
        addr.country_code ? addr.country_code.toUpperCase() : "",
        ...extras.filter(Boolean).map((s) => String(s)),
      ].filter(Boolean)

      doc.font("PJS").fontSize(10).fillColor(BRAND_PRIMARY)
      for (const line of lines) {
        doc.text(String(line), x, y, { width: colW })
        y += 13
      }
    }

    renderAddressColumn(
      "Bill to",
      ML,
      billing,
      [
        order.email ?? null,
        taxExemptAbn ? `ABN ${taxExemptAbn}` : null,
      ]
    )
    renderAddressColumn(
      "Ship to",
      ML + colW + 24,
      shipping,
      [shipping.phone ?? null]
    )

    // ── ITEMS TABLE ────────────────────────────────────────────────────────
    let tableY = 280

    // Table header
    doc
      .moveTo(ML, tableY)
      .lineTo(PW - MR, tableY)
      .lineWidth(0.5)
      .stroke(RULE_COLOR)

    const headerY = tableY + 8
    doc.font("PJS-Bold").fontSize(9).fillColor(TEXT_MUTED)
    doc.text("ITEM", ML, headerY, { width: usableW * 0.55 })
    doc.text("QTY", ML + usableW * 0.55, headerY, {
      width: usableW * 0.1,
      align: "right",
    })
    doc.text("UNIT", ML + usableW * 0.65, headerY, {
      width: usableW * 0.15,
      align: "right",
    })
    doc.text("TOTAL", ML + usableW * 0.8, headerY, {
      width: usableW * 0.2,
      align: "right",
    })

    tableY = headerY + 18
    doc
      .moveTo(ML, tableY)
      .lineTo(PW - MR, tableY)
      .lineWidth(0.5)
      .stroke(RULE_COLOR)

    let rowY = tableY + 10

    if (items.length === 0) {
      doc
        .font("PJS")
        .fontSize(10)
        .fillColor(TEXT_MUTED)
        .text("No line items.", ML, rowY, { width: usableW, align: "center" })
      rowY += 20
    }

    for (const item of items) {
      // Page break safety: leave room for totals box
      if (rowY > PH - 280) {
        doc.addPage()
        rowY = 48
      }

      const title = String(item.title ?? item.product_title ?? "Item")
      const variant = item.variant_title ? String(item.variant_title) : ""
      const sku = item.variant_sku ? String(item.variant_sku) : ""
      const qty = Number(item.quantity ?? 0)
      const unit = formatMoney(item.unit_price, currency)
      const total = formatMoney(
        item.total ?? toNumber(item.unit_price) * qty,
        currency
      )
      const pricing = getCustomizerPricing(item)
      const hasSplit =
        pricing &&
        typeof pricing.baseUnitPriceCents === "number" &&
        typeof pricing.sideSurchargePerUnitCents === "number" &&
        pricing.sideSurchargePerUnitCents > 0

      const itemColX = ML
      const itemColW = usableW * 0.55 - 8

      // Title
      doc
        .font("PJS-Bold")
        .fontSize(10.5)
        .fillColor(BRAND_PRIMARY)
        .text(title, itemColX, rowY, { width: itemColW })

      let detailY = rowY + Math.max(14, doc.heightOfString(title, { width: itemColW }))

      if (variant) {
        doc
          .font("PJS")
          .fontSize(9)
          .fillColor(TEXT_MUTED)
          .text(`Variant: ${variant}`, itemColX, detailY, { width: itemColW })
        detailY += 12
      }
      if (sku) {
        doc
          .font("PJS")
          .fontSize(9)
          .fillColor(TEXT_MUTED)
          .text(`SKU ${sku}`, itemColX, detailY, { width: itemColW })
        detailY += 12
      }

      if (pricing) {
        doc
          .font("PJS")
          .fontSize(9)
          .fillColor(TEXT_MUTED)
          .text("Custom design archived with print-ready assets.", itemColX, detailY, {
            width: itemColW,
          })
        detailY += 12
      }

      if (hasSplit) {
        const garmentMajor = pricing!.baseUnitPriceCents! / 100
        const printMajor = pricing!.sideSurchargePerUnitCents! / 100
        const labelX = itemColX + 8
        const amountX = itemColX + itemColW - 60

        doc.font("PJS").fontSize(9).fillColor(TEXT_MUTED)
        doc.text("Garment / unit", labelX, detailY, { width: 120 })
        doc
          .font("PJS")
          .fontSize(9)
          .fillColor(BRAND_PRIMARY)
          .text(formatMoney(garmentMajor, currency), amountX, detailY, {
            width: 60,
            align: "right",
          })
        detailY += 12

        doc.font("PJS").fontSize(9).fillColor(TEXT_MUTED)
        doc.text("Print / unit", labelX, detailY, { width: 120 })
        doc
          .font("PJS")
          .fontSize(9)
          .fillColor(BRAND_PRIMARY)
          .text(formatMoney(printMajor, currency), amountX, detailY, {
            width: 60,
            align: "right",
          })
        detailY += 12
      }

      // Right-side qty / unit / total — vertically aligned to title row
      doc
        .font("PJS")
        .fontSize(10.5)
        .fillColor(BRAND_PRIMARY)
        .text(String(qty), ML + usableW * 0.55, rowY, {
          width: usableW * 0.1,
          align: "right",
        })
      doc.text(unit, ML + usableW * 0.65, rowY, {
        width: usableW * 0.15,
        align: "right",
      })
      doc
        .font("PJS-Bold")
        .fontSize(10.5)
        .text(total, ML + usableW * 0.8, rowY, {
          width: usableW * 0.2,
          align: "right",
        })

      rowY = Math.max(rowY + 24, detailY + 6)
      doc
        .moveTo(ML, rowY)
        .lineTo(PW - MR, rowY)
        .lineWidth(0.5)
        .stroke(RULE_COLOR)
      rowY += 10
    }

    // ── TOTALS ─────────────────────────────────────────────────────────────
    if (rowY > PH - 220) {
      doc.addPage()
      rowY = 48
    }

    const totalsX = ML + usableW * 0.55
    const totalsLabelW = usableW * 0.25
    const totalsAmountW = usableW * 0.2
    let totalsY = rowY + 6

    const writeTotalRow = (
      label: string,
      amount: string,
      opts: { bold?: boolean; rule?: boolean } = {}
    ) => {
      if (opts.rule) {
        doc
          .moveTo(totalsX, totalsY)
          .lineTo(PW - MR, totalsY)
          .lineWidth(1)
          .stroke(BRAND_PRIMARY)
        totalsY += 6
      }
      doc
        .font(opts.bold ? "PJS-Bold" : "PJS")
        .fontSize(opts.bold ? 12 : 10)
        .fillColor(BRAND_PRIMARY)
        .text(label, totalsX, totalsY, { width: totalsLabelW })
      doc
        .font(opts.bold ? "PJS-Bold" : "PJS")
        .fontSize(opts.bold ? 12 : 10)
        .fillColor(BRAND_PRIMARY)
        .text(amount, totalsX + totalsLabelW, totalsY, {
          width: totalsAmountW,
          align: "right",
        })
      totalsY += opts.bold ? 22 : 18
    }

    const subtotalLabel = "Subtotal (excl. shipping and GST)"
    writeTotalRow(subtotalLabel, formatMoney(order.subtotal, currency))

    if (toNumber(order.shipping_total) > 0) {
      writeTotalRow("Shipping", formatMoney(order.shipping_total, currency))
    }

    if (taxExempt) {
      writeTotalRow("GST (exempt)", formatMoney(0, currency))
    } else {
      writeTotalRow("GST", formatMoney(order.tax_total, currency))
    }

    const grandTotal = taxExempt
      ? toNumber(order.total) - toNumber(order.tax_total)
      : toNumber(order.total)
    writeTotalRow(`Total ${currency}`, formatMoney(grandTotal, currency), {
      bold: true,
      rule: true,
    })

    // ── DELIVERY ───────────────────────────────────────────────────────────
    const methods = order.shipping_methods ?? []
    if (methods.length > 0) {
      totalsY += 8
      doc
        .font("PJS-Bold")
        .fontSize(9)
        .fillColor(TEXT_MUTED)
        .text("DELIVERY", ML, totalsY, { characterSpacing: 0.6 })
      totalsY += 14
      for (const m of methods) {
        const name = m.name ? String(m.name) : "Shipping"
        const amount = formatMoney(m.amount, currency)
        doc
          .font("PJS")
          .fontSize(10)
          .fillColor(BRAND_PRIMARY)
          .text(`${name}  ·  ${amount}`, ML, totalsY)
        totalsY += 14
      }
    }

    if (taxExempt && taxExemptReason) {
      totalsY += 10
      doc
        .font("PJS")
        .fontSize(8.5)
        .fillColor(TEXT_MUTED)
        .text(
          `This is a no-GST tax invoice issued to a tax-exempt customer: ${taxExemptReason}.`,
          ML,
          totalsY,
          { width: usableW }
        )
    }

    // ── FOOTER ─────────────────────────────────────────────────────────────
    const footerY = PH - 36
    doc
      .font("PJS")
      .fontSize(8)
      .fillColor(TEXT_MUTED)
      .text(
        `Generated ${new Date().toLocaleString("en-AU")}  ·  SC PRINTS  ·  ${order.id}`,
        ML,
        footerY,
        { width: usableW, align: "center" }
      )

    doc.end()
  })
}
